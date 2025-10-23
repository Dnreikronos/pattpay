import { type Receiver } from "@prisma/client";
import bcrypt from "bcrypt";

export const sanitizeUser = (receiver: Receiver) => {
  const { passwordHash, ...user } = receiver;
  return user;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  plain: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
