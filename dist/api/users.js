import { createUser, updateUser, updateUserChirpyRed } from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getAPIKey, getBearerToken, hashPassword, validateJWT } from "../auth.js";
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
        isChirpyRed: user.isChirpyRed,
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
        isChirpyRed: user.isChirpyRed,
    });
}
export async function handlerUpdateChirpyRed(req, res) {
    const params = req.body;
    if (!params || !params.event || !params.data || !params.data.userId) {
        throw new BadRequestError("Missing required fields");
    }
    if (params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }
    const APIKey = getAPIKey(req);
    if (APIKey != config.api.polkaKey) {
        throw new UserNotAuthenticatedError("User not authenticated");
    }
    const updatedUser = await updateUserChirpyRed(params.data.userId);
    if (!updatedUser) {
        throw new NotFoundError(`User not found for the userId: ${params.data.userId}`);
    }
    res.status(204).send();
}
