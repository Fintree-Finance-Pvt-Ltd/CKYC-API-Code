import { describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersModule } from '@modules/providers/providers.module';
import {
  CKYC_SEARCH_PROVIDER,
  CKYC_DOWNLOAD_PROVIDER,
  CKYC_UPLOAD_PROVIDER,
  CKYC_UPDATE_PROVIDER,
} from '@modules/providers/provider.tokens';
import { BefiscService } from '@modules/providers/befisc/befisc.service';
import { NetwinService } from '@modules/providers/netwin/netwin.service';
import { ConfigModule } from '@nestjs/config';

describe('Provider Injection Tokens', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ProvidersModule,
      ],
    }).compile();
  });

  it('should resolve CKYC_SEARCH_PROVIDER as BefiscService', () => {
    const searchProvider = moduleRef.get(CKYC_SEARCH_PROVIDER);
    expect(searchProvider).toBeDefined();
    expect(searchProvider).toBeInstanceOf(BefiscService);
  });

  it('should resolve CKYC_DOWNLOAD_PROVIDER as BefiscService', () => {
    const downloadProvider = moduleRef.get(CKYC_DOWNLOAD_PROVIDER);
    expect(downloadProvider).toBeDefined();
    expect(downloadProvider).toBeInstanceOf(BefiscService);
  });

  it('should resolve CKYC_UPLOAD_PROVIDER as NetwinService', () => {
    const uploadProvider = moduleRef.get(CKYC_UPLOAD_PROVIDER);
    expect(uploadProvider).toBeDefined();
    expect(uploadProvider).toBeInstanceOf(NetwinService);
  });

  it('should resolve CKYC_UPDATE_PROVIDER as NetwinService', () => {
    const updateProvider = moduleRef.get(CKYC_UPDATE_PROVIDER);
    expect(updateProvider).toBeDefined();
    expect(updateProvider).toBeInstanceOf(NetwinService);
  });
});
