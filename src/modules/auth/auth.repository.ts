import { REFRESH_TOKEN_TTL } from "@/config/constants";
import { prisma } from "@/db";
import { CustomError } from "@/utils/customErrors";
import { v7 as uuidv7 } from "uuid";

export const authRepository = {
  createRefreshToken(jti: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        jti,
        userId,
        expiresAt,
      },
    });
  },

  findRefreshToken(jti: string) {
    return prisma.refreshToken.findUnique({
      where: {
        jti,
      },
    });
  },

  revokeExpiredRefreshTokens() {
    return prisma.refreshToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });
  },

  async rotateRefreshToken(jti: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const oldToken = await tx.refreshToken.findUnique({
        where: { jti },
      });

      if (!oldToken || oldToken.userId !== userId) {
        throw new CustomError(401, "Invalid refresh token");
      }

      if (oldToken.revoked) {
        await tx.refreshToken.updateMany({
          where: {
            userId,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });

        return { reuseDetected: true };
      }

      await tx.refreshToken.update({
        where: { jti },
        data: { revoked: true },
      });

      const newToken = await tx.refreshToken.create({
        data: {
          jti: uuidv7(),
          userId,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        },
        select: {
          jti: true,
          userId: true,
          expiresAt: true,
        },
      });

      return {
        reuseDetected: false,
        newToken,
      };
    });
  },
};
