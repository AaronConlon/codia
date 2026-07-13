#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));

const env = process.env;
const releaseTag =
  env.OVO_RELEASE_VERSION ||
  env.APP_VERSION ||
  env.GITHUB_REF_NAME ||
  `v${packageJson.version}`;
const commitSha = env.OVO_RELEASE_COMMIT || env.GITHUB_SHA || "local";
const releaseId = commitSha;
const bundleName = `codia-${releaseTag}-ovo.zip`;
const releaseRoot = join(rootDir, ".release");
const releaseDir = join(releaseRoot, `codia-${releaseTag}`);
const zipPath = join(releaseRoot, bundleName);
const manifestPath = join(releaseDir, "meta.json");
const healthcheckUrl = env.OVO_HEALTHCHECK_URL || "http://127.0.0.1:3000/api/health";
const zipPassword = env.BUNDLE_ZIP_PASSWORD || randomBytes(24).toString("hex");

if (!releaseTag) {
  throw new Error("missing release tag");
}

if (!zipPassword || zipPassword.startsWith("-")) {
  throw new Error('BUNDLE_ZIP_PASSWORD must be non-empty and must not start with "-"');
}

await rm(releaseDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(releaseDir, { recursive: true });

for (const entry of [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "Dockerfile",
  "docker-compose.yml",
  ".dockerignore",
  "src",
  "public",
]) {
  await cp(join(rootDir, entry), join(releaseDir, entry), { recursive: true });
}

await mkdir(join(releaseDir, "scripts"), { recursive: true });
await cp(join(rootDir, "scripts", "ovo"), join(releaseDir, "scripts", "ovo"), {
  recursive: true,
});

const runtimeEnv = {
  PORT: env.PORT || "3000",
  CODIA_HOST_PORT: env.CODIA_HOST_PORT || env.PORT || "3000",
  APP_VERSION: releaseTag,
  OVO_RELEASE_VERSION: releaseTag,
  OVO_RELEASE_COMMIT: commitSha,
  OVO_DEPLOY_TARGET_ROOT: env.OVO_DEPLOY_TARGET_ROOT || "/opt/codia",
  OVO_DOCKER_NETWORK: env.OVO_DOCKER_NETWORK || "web",
  OVO_COMPOSE_PROJECT_NAME: env.OVO_COMPOSE_PROJECT_NAME || "codia",
  OVO_CONTAINER_NAME: env.OVO_CONTAINER_NAME || "codia",
  OVO_HEALTHCHECK_URL: healthcheckUrl,
  OVO_HEALTHCHECK_TIMEOUT_SECONDS: env.OVO_HEALTHCHECK_TIMEOUT_SECONDS || "60",
};

await writeFile(
  join(releaseDir, ".env"),
  `${Object.entries(runtimeEnv)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("\n")}\n`,
);

const meta = {
  release_id: releaseId,
  release_tag: releaseTag,
  bundle_name: bundleName,
  built_at: new Date().toISOString(),
  build: {
    commit_sha: commitSha,
    branch: env.GITHUB_REF_NAME || "",
    actor: env.GITHUB_ACTOR || "",
    workflow: env.GITHUB_WORKFLOW || "",
    run_id: env.GITHUB_RUN_ID || "",
  },
  archive: {
    format: "zip",
    compression_method: "deflate",
    compression_level: 9,
    file_name: bundleName,
    password: zipPassword,
  },
  runtime: {
    kind: "docker-compose-build",
    compose_file: "docker-compose.yml",
    container_name: runtimeEnv.OVO_CONTAINER_NAME,
  },
  deploy: {
    entrypoint: "scripts/ovo/deploy.sh",
    extract_path: runtimeEnv.OVO_DEPLOY_TARGET_ROOT,
    docker_network: runtimeEnv.OVO_DOCKER_NETWORK,
    strategy: "compose-up",
  },
  ovo_env: {
    OVO_HEALTHCHECK_URL: healthcheckUrl,
  },
  healthcheck: {
    timeout_seconds: Number(runtimeEnv.OVO_HEALTHCHECK_TIMEOUT_SECONDS),
  },
  scripts: {
    deploy: "scripts/ovo/deploy.sh",
    healthcheck: "scripts/ovo/healthcheck.sh",
    status: "scripts/ovo/status.sh",
  },
};

await writeFile(manifestPath, `${JSON.stringify(meta, null, 2)}\n`);
const parsedMeta = JSON.parse(await readFile(manifestPath, "utf8"));

if (
  !parsedMeta.release_tag ||
  parsedMeta.archive.compression_method !== "deflate" ||
  parsedMeta.archive.compression_level < 8 ||
  !parsedMeta.archive.password ||
  parsedMeta.archive.password.startsWith("-") ||
  parsedMeta.deploy.entrypoint !== "scripts/ovo/deploy.sh"
) {
  throw new Error("invalid OVO meta.json");
}

const zipResult = spawnSync("zip", ["-r", "-9", "-P", zipPassword, zipPath, "."], {
  cwd: releaseDir,
  stdio: "inherit",
});

if (zipResult.status !== 0) {
  throw new Error("failed to create OVO bundle zip");
}

const zipContent = await readFile(zipPath);
const zipSha256 = createHash("sha256").update(zipContent).digest("hex");
const compactManifest = JSON.stringify(parsedMeta);

if (env.GITHUB_ENV) {
  await writeFile(
    env.GITHUB_ENV,
    [
      `BUNDLE_ZIP_PATH=${zipPath}`,
      `BUNDLE_MANIFEST_JSON=${compactManifest}`,
      `BUNDLE_RELEASE_TAG=${releaseTag}`,
      `BUNDLE_NAME=${bundleName}`,
      `BUNDLE_SHA256=${zipSha256}`,
    ].join("\n") + "\n",
    { flag: "a" },
  );
}

console.log(`bundle_path=${zipPath}`);
console.log(`manifest_path=${manifestPath}`);
console.log(`release_tag=${releaseTag}`);
console.log(`sha256=${zipSha256}`);
