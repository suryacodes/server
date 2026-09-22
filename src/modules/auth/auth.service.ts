import { generateAccessToken, generateRefreshToken } from "@/utils/jwt";
import { userRepo } from "../users/user.repository";
import { LoginSchema } from "./auth.schema";
import bcrypt from "bcrypt";
import { REFRESH_TOKEN_TTL } from "@/config/constants";
import { v7 as uuidv7 } from "uuid";
import { authRepository } from "./auth.repository";
import { CustomError } from "@/utils/customErrors";

export const authService = {
  async login(cred: LoginSchema) {
    const user = await userRepo.findByEmailOrPhone(cred);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(cred.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const membership = user.companies?.[0];

    if (!membership) {
      throw new CustomError(401, "User has no company membership");
    }

    const { companyId, roleId } = membership;

    const jti = uuidv7();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

    const accessToken = generateAccessToken(
      user.id,
      companyId,
      roleId.toString(),
    );

    const refreshToken = generateRefreshToken(user.id, jti, expiresAt);
    await authRepository.createRefreshToken(jti, user.id, expiresAt);

    const { password, companies, ...safeUser } = user;

    return {
      accessToken,
      refreshToken,
      user: safeUser,
    };
  },

  async rotateRefreshToken(jti: string, userId: string) {
    const { reuseDetected, newToken } = await authRepository.rotateRefreshToken(
      jti,
      userId,
    );

    if (reuseDetected) {
      throw new CustomError(401, "Refresh token reuse detected");
    }

    if (!newToken) {
      throw new CustomError(500, "Failed to rotate refresh token");
    }

    const accessToken = generateAccessToken(userId);

    const refreshToken = generateRefreshToken(
      userId,
      newToken.jti,
      newToken.expiresAt,
    );

    return { refreshToken, accessToken };
  },

  async isAllowed(roleId: number, permissions: string[]) {
    const isAllowed = await authRepository.hasAllPermissions(
      roleId,
      permissions,
    );

    if (!isAllowed) {
      throw new CustomError(403, "Not Allowed To Perform This Operation");
    }

    return true;
  },
};
