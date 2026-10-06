import { Module } from '@nestjs/common';
import { NetwinService } from './netwin.service';

@Module({
  providers: [NetwinService],
  exports: [NetwinService],
})
export class NetwinModule {}
