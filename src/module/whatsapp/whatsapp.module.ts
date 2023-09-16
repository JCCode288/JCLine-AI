import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { JwtModule } from '../jwt/jwt.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [JwtModule, WebhooksModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
