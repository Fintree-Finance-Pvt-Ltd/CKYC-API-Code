import { Injectable, Logger } from '@nestjs/common';
import {
  CkycUploadProvider,
  CkycUploadProviderInput,
  CkycUploadProviderResult,
  CkycUpdateProvider,
  CkycUpdateProviderInput,
  CkycUpdateProviderResult,
} from '../interfaces';
import { NetwinMapper } from './netwin.mapper';
import { NETWIN_CONSTANTS } from './netwin.constants';

@Injectable()
export class NetwinService
  implements CkycUploadProvider, CkycUpdateProvider
{
  private readonly logger = new Logger(NetwinService.name);

  async upload(
    input: CkycUploadProviderInput,
  ): Promise<CkycUploadProviderResult> {
    this.logger.warn(
      `CKYC Upload requested for requestId=${input.requestId || 'N/A'}, but ${NETWIN_CONSTANTS.NOT_CONFIGURED_MESSAGE}`,
    );
    return NetwinMapper.toNotConfiguredUploadResult();
  }

  async update(
    input: CkycUpdateProviderInput,
  ): Promise<CkycUpdateProviderResult> {
    this.logger.warn(
      `CKYC Update requested for ckycNo=${input.ckycNo} requestId=${input.requestId || 'N/A'}, but ${NETWIN_CONSTANTS.NOT_CONFIGURED_MESSAGE}`,
    );
    return NetwinMapper.toNotConfiguredUpdateResult();
  }
}
