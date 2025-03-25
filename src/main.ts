import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const clientHost = configService.get<string>('CLIENT_HOST');

  app.enableCors({
    origin: [clientHost],
    methods: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
}

bootstrap();
