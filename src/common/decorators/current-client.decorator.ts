import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CkycClient } from '@prisma/client';

export const CurrentClient = createParamDecorator(
  (data: keyof CkycClient | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const client = request.client as CkycClient | undefined;

    if (!client) {
      return null;
    }

    return data ? client[data] : client;
  },
);
