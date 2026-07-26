import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { loadEnv } from "@engineerya/config";

/**
 * Single place every unhandled error passes through. Two jobs:
 *   1. Consistent error JSON shape across the whole API.
 *   2. In production, an unexpected (non-HttpException) error returns a
 *      generic message — the real error is logged server-side, never
 *      handed to the client. Stack traces and internal error strings
 *      (which can leak file paths, query fragments, library versions)
 *      are exactly the kind of thing that makes an attacker's job easier.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");
  private readonly isProduction = loadEnv().NODE_ENV === "production";

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string; method: string }>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = "Internal server error.";
    if (isHttpException) {
      const body = exception.getResponse();
      message = typeof body === "string" ? body : (body as { message: string | string[] }).message;
    } else if (!this.isProduction) {
      message = exception instanceof Error ? exception.message : "Unknown error.";
    }

    if (!isHttpException) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${
          exception instanceof Error ? exception.stack : String(exception)
        }`
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
