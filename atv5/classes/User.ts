import { PrismaClient, User as UserModel } from "@prisma/client";
const prisma = new PrismaClient();

export class User {
  constructor(public name: string, public email: string) {}

  async save(): Promise<UserModel> {
    return prisma.user.create({
      data: { name: this.name, email: this.email },
    });
  }

  static async list(): Promise<UserModel[]> {
    return prisma.user.findMany({ include: { tasks: true } });
  }
}
