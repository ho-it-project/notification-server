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
bootstrap().catch((err) => {
  console.error(err);
});
