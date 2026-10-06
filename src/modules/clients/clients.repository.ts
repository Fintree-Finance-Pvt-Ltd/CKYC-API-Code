import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { CkycClient } from '@prisma/client';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientCode(clientCode: string): Promise<CkycClient | null> {
    return this.prisma.ckycClient.findUnique({
      where: { clientCode },
    });
  }

  async findById(id: bigint): Promise<CkycClient | null> {
    return this.prisma.ckycClient.findUnique({
      where: { id },
    });
  }

  async createClient(data: {
    clientCode: string;
    clientName: string;
    apiKeyHash: string;
    isActive?: boolean;
  }): Promise<CkycClient> {
    return this.prisma.ckycClient.create({
      data: {
        clientCode: data.clientCode,
        clientName: data.clientName,
        apiKeyHash: data.apiKeyHash,
        isActive: data.isActive ?? true,
      },
    });
  }
}
