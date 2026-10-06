import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BefiscService } from './befisc.service';

@Module({
  imports: [HttpModule],
  providers: [BefiscService],
  exports: [BefiscService],
})
export class BefiscModule {}
