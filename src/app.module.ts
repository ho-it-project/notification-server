import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { PrismaModule } from '@common/prisma/prisma.module';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Joi from 'joi';
import { v4 } from 'uuid';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat.module';
import { ErModule } from './modules/er.module';
import { ReqModule } from './modules/req.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'notification',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `notification-${v4()}`,
            brokers: process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',').map((a) => a.trim()) as string[],
          },
          consumer: {
            groupId: 'hoit-notification',
          },
        },
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        KAFKA_BOOTSTRAP_SERVERS: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
      }),
    }),
    PrismaModule,
    ChatModule,
    ErModule,
    ReqModule,
    EventEmitterModule.forRoot(),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
