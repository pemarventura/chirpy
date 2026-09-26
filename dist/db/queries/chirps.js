import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
export async function createChirp(chirp) {
    const [rows] = await db.insert(chirps).values(chirp).returning();
    return rows;
}
export async function getChirps() {
    return db.select().from(chirps).orderBy(asc(chirps.createdAt));
}
export async function getChirp(id) {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
    return result;
}
export async function deleteChirp(id) {
    const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
    return rows.length > 0;
}
