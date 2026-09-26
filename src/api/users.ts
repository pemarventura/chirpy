import type { Request, Response } from "express";

import { createUser, updateUsers } from "../db/queries/users.js";
import { BadRequestError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "../db/schema.js";
import { validateJWT, hashPassword, getBearerToken } from "../auth.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword"> & {
  token?: string;
};

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}

export async function handlerUsersChangeCredentials(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

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
    } satisfies UserResponse);
  }
  catch {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }
}


