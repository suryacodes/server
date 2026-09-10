declare global {
  namespace Express {
    interface Request {
      userId: string;
      refreshTokenJti: string;
    }
  }
}

export {};
