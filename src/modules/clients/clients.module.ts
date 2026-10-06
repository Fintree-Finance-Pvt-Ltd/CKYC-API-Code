import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';

@Module({
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService, ClientsRepository],
})
export class ClientsModule {}
