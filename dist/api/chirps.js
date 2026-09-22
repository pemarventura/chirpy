import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
export async function handleChirps(req, res) {
    const params = req.body;
    if (!params.body || !params.userId) {
        throw new BadRequestError("Missing required fields");
    }
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }
    const words = params.body.split(" ");
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const loweredWord = word.toLowerCase();
        if (badWords.includes(loweredWord)) {
            words[i] = "****";
        }
    }
    const cleaned = words.join(" ");
    const chirp = await createChirp({
        body: cleaned,
        userId: params.userId,
    });
    respondWithJSON(res, 201, chirp);
}
export async function handlerChirpsRetrieve(_, res) {
    const chirps = await getChirps();
    respondWithJSON(res, 200, chirps);
}
export async function handlerChirpRetrieveById(req, res) {
    const { chirpId } = req.params;
    if (!chirpId) {
        throw new BadRequestError("Missing chirpId parameter");
    }
    const chirp = await getChirpById(String(chirpId));
    if (!chirp) {
        res.status(404).send();
        return;
    }
    respondWithJSON(res, 200, chirp);
}
