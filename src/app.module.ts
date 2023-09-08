import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat.module';
import { ErModule } from './modules/er.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // KafkaModule.register({
    //   clientId: v4(),
    //   brokers: ['localhost:9092', 'localhost:9093', 'localhost:9094'],
    //   groupId: 'hoit',
    // }),
    ChatModule,
    ErModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
