import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ClientsRepository } from './clients.repository';
import { CkycClient } from '@prisma/client';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly clientsRepository: ClientsRepository) {}

  async validateClient(
    clientCode: string,
    apiKey: string,
  ): Promise<CkycClient | null> {
    if (!clientCode || !apiKey) {
      return null;
    }

    const client = await this.clientsRepository.findByClientCode(clientCode);
    if (!client) {
      this.logger.warn(
        `Client validation failed: unknown client code '${clientCode}'`,
      );
      return null;
    }

    if (!client.isActive) {
      this.logger.warn(
        `Client validation failed: client '${clientCode}' is inactive`,
      );
      return null;
    }

    const isMatch = await bcrypt.compare(apiKey, client.apiKeyHash);
    if (!isMatch) {
      this.logger.warn(
        `Client validation failed: invalid API key for client '${clientCode}'`,
      );
      return null;
    }

    return client;
  }

  async hashApiKey(apiKey: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(apiKey, saltRounds);
  }

  async getClientByCode(clientCode: string): Promise<CkycClient | null> {
    return this.clientsRepository.findByClientCode(clientCode);
  }
}
