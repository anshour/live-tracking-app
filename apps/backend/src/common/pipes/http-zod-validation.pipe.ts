import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export class HttpZodValidationPipe<T = any>
  implements PipeTransform<unknown, T>
{
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new BadRequestException({
          message: errorMessages,
        });
      }
      throw new BadRequestException({
        message: 'Validation failed',
      });
    }
  }
}
