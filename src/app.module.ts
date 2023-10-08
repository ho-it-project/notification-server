import { KafkaModule } from '@common/kafka/kafka.module';
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { PrismaModule } from '@common/prisma/prisma.module';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { v4 } from 'uuid';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat.module';
import { ErModule } from './modules/er.module';
import { ReqModule } from './modules/req.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    KafkaModule.register({
      clientId: v4(),
      brokers: ['localhost:9092', 'localhost:9093', 'localhost:9094'],
      groupId: 'hoit1-notification',
    }),
    PrismaModule,
    ChatModule,
    ErModule,
    ReqModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
