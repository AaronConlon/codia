import type { AppInstance } from "../../types.js";
import { route_POST_satisfaction } from "./post-satisfaction.route.js";

export const createFeedbackController = (app: AppInstance) => {
  route_POST_satisfaction(app);
};
