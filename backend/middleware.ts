import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface customPayload extends JwtPayload {
  user: {
    id: number,
    email: string
  }
}

export const authmiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.token;

  if (typeof token != "string") {
    return res.json({
      msg: "token not available ",
    });
  }
  try {
    const decode = jwt.verify(token, "secret!@#") as customPayload;
    const user = decode.user; 
     req.userId  = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "broken or malformed token", error });
  }
};
