import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  app.use(helmet());

  app.enableCors({
    origin: [/^http:\/\/localhost:(.*)/is, /(.*)line(.*)/is, /(openai)/is],
    methods: 'GET,POST',
    preflightContinue: false,
  });
}
bootstrap();
