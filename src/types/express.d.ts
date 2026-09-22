declare global {
  namespace Express {
    interface Request {
      userId: string;
      refreshTokenJti: string;
      tenantId: string;
      roleId: number;
    }
  }
}

export {};
