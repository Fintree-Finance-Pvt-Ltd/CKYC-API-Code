import { Module } from '@nestjs/common';
import { ProvidersModule } from '@modules/providers/providers.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { DownloadController } from './download/download.controller';
import { DownloadService } from './download/download.service';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { UpdateController } from './update/update.controller';
import { UpdateService } from './update/update.service';
import { StatusController } from './status/status.controller';
import { StatusService } from './status/status.service';

@Module({
  imports: [ProvidersModule, ClientsModule],
  controllers: [
    SearchController,
    DownloadController,
    UploadController,
    UpdateController,
    StatusController,
  ],
  providers: [
    SearchService,
    DownloadService,
    UploadService,
    UpdateService,
    StatusService,
  ],
  exports: [
    SearchService,
    DownloadService,
    UploadService,
    UpdateService,
    StatusService,
  ],
})
export class CkycModule {}
