import type { AppInstance } from "../../types.js";
import { route_GET_code_example } from "./get-code-example.route.js";
import { route_GET_llms_txt } from "./get-llms-txt.route.js";
import { route_POST_code_render } from "./post-code-render.route.js";

export const createCodeController = (app: AppInstance) => {
  route_GET_code_example(app);
  route_GET_llms_txt(app);
  route_POST_code_render(app);
};
