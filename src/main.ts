import { winstonLogger } from '@common/logger/logger';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 8000;
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });
  const docs = require('../packages/api/swagger.json');
  docs.servers = [{ url: 'notification' }];
  SwaggerModule.setup('docs', app, docs);
  app.setGlobalPrefix('api');
  await app.listen(port);
}
bootstrap();
