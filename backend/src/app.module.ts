import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlanningModule } from './planning/planning.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityModule } from './availability/availability.module';
import { TimeModule } from './time/time.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PlanningModule,
    AvailabilityModule,
    TimeModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'planner-db',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'planner',
      autoLoadEntities: true,
      synchronize: true
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
