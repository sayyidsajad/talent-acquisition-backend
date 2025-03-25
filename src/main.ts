import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as functions from 'firebase-functions';

let server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const clientHost = configService.get('CLIENT_HOST') || '*';
  app.enableCors({
    origin: [clientHost],
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  await app.init();

  const expressInstance = app.getHttpAdapter().getInstance();
  server = functions.https.onRequest(expressInstance);
}

bootstrap().catch(console.error);

export { server };
