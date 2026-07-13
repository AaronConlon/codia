import type { AppInstance } from "../../types.js";
import { route_GET_home } from "./get-home.route.js";

export const createSiteController = (app: AppInstance) => {
  route_GET_home(app);
};
