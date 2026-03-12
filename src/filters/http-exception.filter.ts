import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const PG_ERROR_MESSAGES: Record<string, string> = {
  '23503': 'Referência inválida: um dos campos aponta para um registro inexistente.',
  '23505': 'Já existe um registro com esses dados.',
  '23502': 'Um campo obrigatório não foi informado.',
  '22P02': 'Formato de dado inválido.',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno no servidor.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(res.message)
          ? (res.message as string[]).join('; ')
          : (res.message as string) ?? message;
        error = (res.error as string) ?? error;
      }
    } else if (exception instanceof QueryFailedError) {
      const pgCode = (exception as any).code as string;
      message = PG_ERROR_MESSAGES[pgCode] ?? 'Erro ao executar operação no banco de dados.';
      error = 'Database Error';
      this.logger.error(`DB error [${pgCode}]: ${exception.message}`);
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      status: 'error',
      statusCode: status,
      error,
      message,
      path: request.url,
    });
  }
}
