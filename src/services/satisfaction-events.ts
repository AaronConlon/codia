import { sql } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  satisfactionEvents,
  type NewSatisfactionEvent,
} from "../db/schema.js";

export type SatisfactionAction = "copy" | "download";

export const createSatisfactionEvent = (action: SatisfactionAction) => {
  const event: NewSatisfactionEvent = {
    action,
    createdAt: new Date().toISOString(),
  };

  db.insert(satisfactionEvents).values(event).run();
};

export const getSatisfactionCount = () => {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(satisfactionEvents)
    .get();

  return Number(result?.count ?? 0);
};
