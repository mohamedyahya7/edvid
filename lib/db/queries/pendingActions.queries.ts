import { SQLiteDatabase } from "expo-sqlite";

export type PendingAction = {
  id: number;
  action_type:
    | "like_video"
    | "unlike_video"
    | "follow_teacher"
    | "unfollow_teacher";
  payload: string; // JSON string
  status: "pending" | "success" | "failed";
  created_at: string;
  attempts: number;
};

const getOppositeAction = (
  action_type: PendingAction["action_type"]
): PendingAction["action_type"] | null => {
  switch (action_type) {
    case "like_video":
      return "unlike_video";
    case "unlike_video":
      return "like_video";
    case "follow_teacher":
      return "unfollow_teacher";
    case "unfollow_teacher":
      return "follow_teacher";
    default:
      return null;
  }
};

export const addPendingAction = async (
  db: SQLiteDatabase,
  action_type: PendingAction["action_type"],
  payload: object
): Promise<void> => {
  const payloadStr = JSON.stringify(payload);
  const oppositeActionType = getOppositeAction(action_type);

  if (oppositeActionType) {
    // Check for an existing opposite action with the same payload
    const existingAction = await db.getFirstAsync<PendingAction>(
      "SELECT * FROM pending_actions WHERE action_type = ? AND payload = ?;",
      [oppositeActionType, payloadStr]
    );

    if (existingAction) {
      // If found, remove the existing action and don't add the new one (they cancel out)
      await removePendingAction(db, existingAction.id);
      console.log(
        `[Sync] Canceled out pending action for ${oppositeActionType} with new action ${action_type}.`
      );
      return;
    }
  }

  // If no opposite action exists, add the new action
  await db.runAsync(
    "INSERT INTO pending_actions (action_type, payload) VALUES (?, ?);",
    [action_type, payloadStr]
  );
  console.log(`[Sync] Added pending action: ${action_type}`);
};

export const getPendingActions = async (
  db: SQLiteDatabase
): Promise<PendingAction[]> => {
  return await db.getAllAsync<PendingAction>(
    "SELECT * FROM pending_actions WHERE status = 'pending' ORDER BY created_at ASC;"
  );
};

export const removePendingAction = async (
  db: SQLiteDatabase,
  actionId: number
): Promise<void> => {
  await db.runAsync("DELETE FROM pending_actions WHERE id = ?;", [actionId]);
  console.log(`[Sync] Removed pending action: ${actionId}`);
};

export const incrementActionAttempt = async (
  db: SQLiteDatabase,
  actionId: number
): Promise<void> => {
  await db.runAsync(
    "UPDATE pending_actions SET attempts = attempts + 1 WHERE id = ?;",
    [actionId]
  );
};
