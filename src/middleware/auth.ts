import { RequestHandler } from "express";
import AppError from "../error/AppError.js";
import { TokenPayload, verifyToken } from "../services/tokenService.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const getToken = (authHeader?: string, xAuthToken?: string) => {
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return xAuthToken;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = getToken(req.headers.authorization, req.header("x-auth-token"));
  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user?.isAdmin) return next(new AppError(403, "Admin access required"));
  next();
};

export const requireBusiness: RequestHandler = (req, _res, next) => {
  if (!req.user?.isBusiness) return next(new AppError(403, "Business account required"));
  next();
};

export const requireSelf: RequestHandler = (req, _res, next) => {
  if (req.user?._id !== req.params.id) {
    return next(new AppError(403, "You can only perform this action on your own account"));
  }
  next();
};

export const requireSelfOrAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?._id !== req.params.id && !req.user?.isAdmin) {
    return next(new AppError(403, "Access denied"));
  }
  next();
};
