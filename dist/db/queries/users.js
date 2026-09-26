import { db } from "../index.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createUser(user) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function reset() {
    await db.delete(users);
}
export async function getUserByEmail(email) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}
export async function getUserFromRefreshToken(userId) {
    const [result] = await db.select().from(users).where(eq(users.id, userId));
    return result;
}
export async function updateUsers(userId, email, hashedPassword) {
    const rows = await db
        .update(users)
        .set({ email: email, hashedPassword: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    return rows[0];
}
