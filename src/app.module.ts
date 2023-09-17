import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { WebhooksModule } from './module/whatsapp/webhooks/webhooks.module';
import { WhatsappModule } from './module/whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from './module/openai/openai.module';
import { LineModule } from './module/line/line.module';
import { JwtModule } from './module/jwt/jwt.module';
import { LineWebhookModule } from './module/line/line-webhook/line-webhook.module';

const appModules = [WebhooksModule, WhatsappModule, OpenAIModule, LineModule];
const configModules = [ConfigModule.forRoot({ isGlobal: true })];

@Module({
  imports: [...appModules, ...configModules, LineModule, JwtModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
