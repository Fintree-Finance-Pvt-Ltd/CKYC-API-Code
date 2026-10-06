import {
  CkycUploadProviderInput,
  CkycUploadProviderResult,
  CkycUpdateProviderInput,
  CkycUpdateProviderResult,
} from '../interfaces';
import { NETWIN_CONSTANTS } from './netwin.constants';

export class NetwinMapper {
  static toNotConfiguredUploadResult(): CkycUploadProviderResult {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      message: NETWIN_CONSTANTS.NOT_CONFIGURED_MESSAGE,
      result: null,
    };
  }

  static toNotConfiguredUpdateResult(): CkycUpdateProviderResult {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      message: NETWIN_CONSTANTS.NOT_CONFIGURED_MESSAGE,
      result: null,
    };
  }
}
