import { userRepo } from "./user.repository";
import { UserCreateDto } from "./user.schema";
import bcrypt from "bcrypt";

export const userService = {
  async createUser(user: UserCreateDto) {
    const hash = await bcrypt.hash(user.password, 10);

    const result = await userRepo.createUser({
      ...user,
      password: hash,
    });
    const { password, ...data } = result;
    return data;
  },
};
