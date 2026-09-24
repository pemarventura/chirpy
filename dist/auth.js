import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";
const TOKEN_ISSUER = "chirpy";
export async function hashPassword(password) {
    return argon2.hash(password);
}
export async function checkPasswordHash(password, hash) {
    if (!password)
        return false;
    try {
        return await argon2.verify(hash, password);
    }
    catch {
        return false;
    }
}
export function makeJWT(userID, expiresIn, secret) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: issuedAt,
        exp: expiresAt,
    }, secret, { algorithm: "HS256" });
    return token;
}
export function validateJWT(tokenString, secret) {
    let decoded;
    try {
        decoded = jwt.verify(tokenString, secret);
    }
    catch (e) {
        throw new UserNotAuthenticatedError("Invalid token");
    }
    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    }
    return decoded.sub;
}
export function getBearerToken(req) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new BadRequestError("Malformed authorization header");
    }
    return extractBearerToken(authHeader);
}
export function extractBearerToken(header) {
    const splitAuth = header.split(" ");
    if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
        throw new BadRequestError("Malformed authorization header");
    }
    return splitAuth[1];
}
export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
