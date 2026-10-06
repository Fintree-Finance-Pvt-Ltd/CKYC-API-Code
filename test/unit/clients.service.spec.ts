import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientsService } from '@modules/clients/clients.service';
import type { ClientsRepository } from '@modules/clients/clients.repository';
import bcrypt from 'bcrypt';

describe('ClientsService', () => {
  let service: ClientsService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByClientCode: vi.fn(),
      createClient: vi.fn(),
    };
    service = new ClientsService(mockRepo as unknown as ClientsRepository);
  });

  it('should validate active client with correct API key', async () => {
    const rawApiKey = 'test_secret_key_123';
    const hash = await bcrypt.hash(rawApiKey, 10);

    mockRepo.findByClientCode.mockResolvedValue({
      id: BigInt(1),
      clientCode: 'LMS_CLIENT',
      clientName: 'LMS System',
      apiKeyHash: hash,
      isActive: true,
    });

    const validated = await service.validateClient('LMS_CLIENT', rawApiKey);
    expect(validated).toBeDefined();
    expect(validated?.clientCode).toBe('LMS_CLIENT');
  });

  it('should reject client if apiKey does not match', async () => {
    const rawApiKey = 'test_secret_key_123';
    const hash = await bcrypt.hash(rawApiKey, 10);

    mockRepo.findByClientCode.mockResolvedValue({
      id: BigInt(1),
      clientCode: 'LMS_CLIENT',
      clientName: 'LMS System',
      apiKeyHash: hash,
      isActive: true,
    });

    const validated = await service.validateClient('LMS_CLIENT', 'wrong_key');
    expect(validated).toBeNull();
  });

  it('should reject client if isActive is false', async () => {
    const rawApiKey = 'test_secret_key_123';
    const hash = await bcrypt.hash(rawApiKey, 10);

    mockRepo.findByClientCode.mockResolvedValue({
      id: BigInt(1),
      clientCode: 'INACTIVE_CLIENT',
      clientName: 'Inactive App',
      apiKeyHash: hash,
      isActive: false,
    });

    const validated = await service.validateClient(
      'INACTIVE_CLIENT',
      rawApiKey,
    );
    expect(validated).toBeNull();
  });
});
