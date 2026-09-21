import { BadRequestError } from "./errors.js";
import { createUser } from "../db/queries/users.js";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function handleCreateUser(req, res) {
    const { email } = req.body;
    if (typeof email !== "string" || !email) {
        throw new BadRequestError(`Invalid request body. Expected a JSON object with an "email" field.`);
    }
    const params = { email };
    if (!EMAIL_REGEX.test(params.email)) {
        throw new BadRequestError(`Invalid email format. Please provide a valid email address.`);
    }
    const newUser = await createUser(params);
    if (!newUser) {
        return res.status(500).json({ error: "Failed to create user." });
    }
    return res.status(201).json(newUser);
}
