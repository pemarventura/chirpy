import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createRefreshToken(refreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getRefreshToken(token) {
    const rows = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if (rows.length === 0) {
        return;
    }
    return rows[0];
}
export async function revokeRefreshToken(token) {
    const now = new Date(Date.now());
    await db.update(refreshTokens).set({ revokedAt: now, updatedAt: now }).where(eq(refreshTokens.token, token));
    return;
}
