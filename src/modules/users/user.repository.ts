import { prisma } from "@/db";
import type { UserCreateDto, UserUpdateDto } from "./user.schema";

type FindUserParams =
  | {
      email: string;
      phoneCode?: never;
      phoneNumber?: never;
    }
  | {
      email?: never;
      phoneCode: string;
      phoneNumber: string;
    };

export const userRepo = {
  findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  },

  findByEmailOrPhone({ email, phoneCode, phoneNumber }: FindUserParams) {
    const conditions = [];

    if (email) {
      conditions.push({ email });
    }

    if (phoneCode && phoneNumber) {
      conditions.push({
        phoneCode,
        phoneNumber,
      });
    }

    return prisma.user.findFirst({
      where: {
        OR: conditions,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneCode: true,
        phoneNumber: true,
        password: true,
        companies: {
          select: {
            companyId: true,
            roleId: true,
          },
        },
      },
    });
  },

  createUser(user: UserCreateDto) {
    return prisma.user.create({
      data: user,
      select: {
        id: true,
        name: true,
        email: true,
        phoneCode: true,
        phoneNumber: true,
        password: true,
      },
    });
  },

  updateUser(user: UserUpdateDto) {
    const { id, ...data } = user;

    return prisma.user.update({
      where: { id },
      data,
    });
  },

  deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  },
};
