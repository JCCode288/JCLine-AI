import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { WebhooksModule } from './module/whatsapp/webhooks/webhooks.module';
import { WhatsappModule } from './module/whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from './module/openai/openai.module';
import { LineModule } from './module/line/line.module';
import { JwtModule } from './module/jwt/jwt.module';
import { ThrottlerModule } from '@nestjs/throttler/dist/throttler.module';

const appModules = [
  WebhooksModule,
  WhatsappModule,
  OpenAIModule,
  LineModule,
  JwtModule,
];
const configModules = [
  ConfigModule.forRoot({ isGlobal: true }),
  ThrottlerModule.forRoot([
    {
      name: 'short::burst',
      ttl: 1000,
      limit: 5,
    },
    {
      name: 'medium::burst',
      ttl: 10000,
      limit: 30,
    },
    {
      name: 'long::burst',
      ttl: 60000,
      limit: 100,
    },
  ]),
];

@Module({
  imports: [...appModules, ...configModules],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
