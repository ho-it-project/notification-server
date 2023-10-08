import { Module } from '@nestjs/common';
import { ReqConsumer } from '@src/consumers/req.consumer';

@Module({
  controllers: [ReqConsumer],
})
export class ReqModule {}
