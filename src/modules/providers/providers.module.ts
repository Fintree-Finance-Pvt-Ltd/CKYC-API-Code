import { Module } from '@nestjs/common';
import { BefiscModule } from './befisc/befisc.module';
import { BefiscService } from './befisc/befisc.service';
import { NetwinModule } from './netwin/netwin.module';
import { NetwinService } from './netwin/netwin.service';
import {
  CKYC_SEARCH_PROVIDER,
  CKYC_DOWNLOAD_PROVIDER,
  CKYC_UPLOAD_PROVIDER,
  CKYC_UPDATE_PROVIDER,
} from './provider.tokens';

@Module({
  imports: [BefiscModule, NetwinModule],
  providers: [
    {
      provide: CKYC_SEARCH_PROVIDER,
      useExisting: BefiscService,
    },
    {
      provide: CKYC_DOWNLOAD_PROVIDER,
      useExisting: BefiscService,
    },
    {
      provide: CKYC_UPLOAD_PROVIDER,
      useExisting: NetwinService,
    },
    {
      provide: CKYC_UPDATE_PROVIDER,
      useExisting: NetwinService,
    },
  ],
  exports: [
    CKYC_SEARCH_PROVIDER,
    CKYC_DOWNLOAD_PROVIDER,
    CKYC_UPLOAD_PROVIDER,
    CKYC_UPDATE_PROVIDER,
    BefiscModule,
    NetwinModule,
  ],
})
export class ProvidersModule {}
