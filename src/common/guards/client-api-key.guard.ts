import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientsService } from '@modules/clients/clients.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClientApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly clientsService: ClientsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientId =
      (request.headers['x-client-id'] as string) ||
      (request.headers['X-CLIENT-ID'] as string);
    const apiKey =
      (request.headers['x-api-key'] as string) ||
      (request.headers['X-API-KEY'] as string);

    if (!clientId || !apiKey) {
      throw new UnauthorizedException(
        'Missing authentication headers: X-CLIENT-ID and X-API-KEY are required',
      );
    }

    const client = await this.clientsService.validateClient(clientId, apiKey);
    if (!client) {
      throw new UnauthorizedException(
        'Invalid client credentials or inactive client account',
      );
    }

    request.client = client;
    return true;
  }
}
