import type { AppInstance } from "../../types.js";
import { route_GET_code_example } from "./get-code-example.route.js";
import { route_GET_llms_txt } from "./get-llms-txt.route.js";
import { route_POST_code_render } from "./post-code-render.route.js";

export type CodeControllerOptions = {
  codeInspectorScript?: string;
};

export const createCodeController = (app: AppInstance, options: CodeControllerOptions = {}) => {
  route_GET_code_example(app, {
    codeInspectorScript: options.codeInspectorScript,
  });
  route_GET_llms_txt(app);
  route_POST_code_render(app);
};
