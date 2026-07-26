import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { loadEnv } from "@engineerya/config";

async function bootstrap() {
  const env = loadEnv();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  // Sets standard protective headers (X-Content-Type-Options,
  // X-Frame-Options, a conservative CSP, HSTS in production, etc.) —
  // one line covering a checklist of header-level hardening that would
  // otherwise be easy to forget.
  app.use(helmet());

  // Strip unknown properties and reject requests that don't match DTOs —
  // the first line of defense against malformed/malicious payloads.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Consistent error shape + no internal error detail leaked to clients
  // in production. See the filter's own comment for why.
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: env.NODE_ENV === "production" ? [process.env.WEB_URL ?? ""] : true,
    credentials: true,
  });

  await app.listen(env.API_PORT);
  // eslint-disable-next-line no-console
  console.log(`🚀 EngineerYa API running on http://localhost:${env.API_PORT}/api/v1`);
}

bootstrap();
