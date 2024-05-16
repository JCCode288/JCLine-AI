import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: ['/.line./is'],
    // origin: '*',
    methods: 'GET,POST',
    preflightContinue: false,
  });

  await app.listen(3000, async () =>
    console.log(`listening to ${await app.getUrl()}`),
  );
}
bootstrap();
