import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import  { env } from './env.js';




 interface TokenPayload extends JwtPayload {
   userId: string
}

export function createToken(payload: TokenPayload): string {
   return jwt.sign( payload, env.jwtSecret, {expiresIn: "7d"})
}

export function requireAuth(req: Request, res: Response, next: NextFunction) :void {
  const authHeader = req.headers.authorization;


  const token = typeof authHeader === "string" && authHeader.startsWith("bearer ") 
  ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({
        error: "Missing auth token"
    })
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const userId = payload.userId;  
    next();
  } catch (error) {
    res.status(401).json({ error: "broken or malformed token", });
  }
};
