import { winstonLogger } from '@common/logger/logger';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
async function bootstrap() {
  const port = process.env.PORT || 8001;
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });
  const docs = require('../packages/api/swagger.json');
  docs.servers = [{ url: 'notification' }];
  SwaggerModule.setup('docs', app, docs);
  // const httpServer = http.createServer(app.getHttpAdapter().getInstance());
  // const io = new IoAdapter(httpServer);
  // app.useWebSocketAdapter(io);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
  });

  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error(err);
});
