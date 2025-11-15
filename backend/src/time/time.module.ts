import { Module } from '@nestjs/common';
import { TimeService } from './time.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Time } from './entities/time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Time])],
  providers: [TimeService],
  exports: [TimeService]
})
export class TimeModule {}
