import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { SocketBadRequestException } from '../exceptions/socket-bad-request.exception';

export class SocketZodValidationPipe<T = any>
  implements PipeTransform<unknown, T>
{
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, metadata: ArgumentMetadata): T {
    // Skip validation for non-body types
    if (metadata.type !== 'body') {
      return value as T;
    }

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new SocketBadRequestException(errorMessages);
      }
      throw new SocketBadRequestException();
    }
  }
}
