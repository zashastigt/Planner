import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './webhook.service';

@Module({
  exports: [WebhookService]
})
export class WebhookModule {}
