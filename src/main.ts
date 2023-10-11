import { winstonLogger } from '@common/logger/logger';
import { RedisIoAdapter } from '@common/redis/redis.adapter';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
async function bootstrap() {
  const port = process.env.PORT || 8001;
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification',
        brokers: process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',').map((a) => a.trim()) as string[],
      },
      consumer: { groupId: 'hoit-notification' },
    },
  });
  // const docs = require('../packages/api/swagger.json');
  // docs.servers = [{ url: 'notification' }];
  // SwaggerModule.setup('docs', app, docs);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
  });
  await app.startAllMicroservices();

  await app.listen(port);
}
bootstrap().catch(() => {
  // 개발환경에서 2개이상 서버를 동시에 실행할 경우 포트 충돌이 발생합니다.
  // 이를 방지하기 위해 8001 포트가 사용중인지 확인하고 사용중이면 8002 포트를 사용하도록 하였습니다.
  if (process.env.NODE_ENV !== 'production') {
    process.env.PORT = 8002 as any;
    bootstrap().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
