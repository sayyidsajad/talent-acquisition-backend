import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const clientHost = configService.get('CLIENT_HOST');
  app.enableCors({
    origin: [clientHost],
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
