import { SignJWT, jwtVerify } from "jose";
import config from "../config/env.js";

export type TokenPayload = {
  _id: string;
  isBusiness: boolean;
  isAdmin: boolean;
};

const secret = new TextEncoder().encode(config.jwtSecret);

export const generateToken = (payload: TokenPayload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn)
    .sign(secret);

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return {
    _id: String(payload._id),
    isBusiness: payload.isBusiness === true,
    isAdmin: payload.isAdmin === true,
  };
};
