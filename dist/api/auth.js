import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken, } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { config } from "../config.js";
import { revokeRefreshToken, saveRefreshToken, userForRefreshToken, } from "../db/queries/refresh.js";
export async function handlerLogin(req, res) {
    const params = req.body;
    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }
    const matching = await checkPasswordHash(params.password, user.hashedPassword);
    if (!matching) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }
    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    const refreshToken = makeRefreshToken();
    const saved = await saveRefreshToken(user.id, refreshToken);
    if (!saved) {
        throw new UserNotAuthenticatedError("could not save refresh token");
    }
    respondWithJSON(res, 200, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
        refreshToken: refreshToken,
    });
}
export async function handlerRefresh(req, res) {
    let refreshToken = getBearerToken(req);
    const result = await userForRefreshToken(refreshToken);
    if (!result) {
        throw new UserNotAuthenticatedError("invalid refresh token");
    }
    const user = result.user;
    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    respondWithJSON(res, 200, {
        token: accessToken,
    });
}
export async function handlerRevoke(req, res) {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
}
