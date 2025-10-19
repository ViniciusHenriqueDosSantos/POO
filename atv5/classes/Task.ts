import { PrismaClient, Task as TaskModel } from "@prisma/client";
const prisma = new PrismaClient();

export class Task {
  constructor(public tittle: string, public userId: number) {}

  async save(): Promise<TaskModel> {
    return prisma.task.create({
      data: { tittle: this.tittle, userId: this.userId },
    });
  }

  static async list(): Promise<TaskModel[]> {
    return prisma.task.findMany({ include: { user: true } });
  }

  static async markAsConcluded(id: number): Promise<TaskModel> {
    return prisma.task.update({
      where: { id },
      data: { concluded: true },
    });
  }
}
