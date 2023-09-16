import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhooksModule } from './module/whatsapp/webhooks/webhooks.module';
import { WhatsappModule } from './module/whatsapp/whatsapp.module';

@Module({
  imports: [WebhooksModule, WhatsappModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
