import { createUser, updateUsers } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { validateJWT, hashPassword, getBearerToken } from "../auth.js";
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
export async function handlerUsersChangeCredentials(req, res) {
    const params = req.body;
    if (!params.password || !params.email) {
        throw new BadRequestError("Missing required fields");
    }
    try {
        const token = getBearerToken(req);
        const userId = validateJWT(token, config.jwt.secret);
        const hashedPassword = await hashPassword(params.password);
        const user = await updateUsers(userId, params.email, hashedPassword);
        respondWithJSON(res, 200, {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    catch {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    }
}
