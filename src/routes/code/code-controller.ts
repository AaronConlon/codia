import type { AppInstance } from "../../types.js";
import { route_GET_code_stats } from "./get-code-stats.route.js";
import { route_GET_try_it } from "./get-try-it.route.js";
import { route_GET_llms_txt } from "./get-llms-txt.route.js";
import { route_POST_code_render } from "./post-code-render.route.js";

export type CodeControllerOptions = {
  codeInspectorScript?: string;
};

export const createCodeController = (app: AppInstance, options: CodeControllerOptions = {}) => {
  route_GET_try_it(app, {
    codeInspectorScript: options.codeInspectorScript,
  });
  route_GET_code_stats(app);
  route_GET_llms_txt(app);
  route_POST_code_render(app);
};
