
declare global {
  namespace Express {
    interface Request {
      userId?: number; // or string, depending on your DB's id type
    }
  }
}

export {};