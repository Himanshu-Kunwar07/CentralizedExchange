
declare global {
  namespace Express {
    interface Request {
      userId?: string; // or string, depending on your DB's id type
    }
  }
}

export {};