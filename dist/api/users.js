import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";
export async function handlerUsersCreate(req, res) {
    const params = req.body;
    if (!params.password || !params.email) {
        throw new BadRequestError("Missing required fields");
    }
    const hashedPassword = await hashPassword(params.password);
    const user = await createUser({
        email: params.email,
        hashedPassword,
    });
    if (!user) {
        throw new Error("Could not create user");
    }
    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}
export async function handlerUsersUpdate(req, res) {
    const token = getBearerToken(req);
    const subject = validateJWT(token, config.jwt.secret);
    const params = req.body;
    if (!params.password || !params.email) {
        throw new BadRequestError("Missing required fields");
    }
    const hashedPassword = await hashPassword(params.password);
    const user = await updateUser(subject, params.email, hashedPassword);
    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
    });
}
