import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../constants/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse() as {
        message?: string | string[];
        error_code?: ErrorCode;
      };

      response.status(status).json({
        success: false,
        error: {
          error_code: responseBody.error_code ?? ErrorCode.VALIDATION_ERROR,
          message: Array.isArray(responseBody.message)
            ? responseBody.message.join(', ')
            : responseBody.message ?? exception.message,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        error_code: ErrorCode.VALIDATION_ERROR,
        message: 'Internal server error',
      },
    });
  }
}
