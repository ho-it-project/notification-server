import { Module } from '@nestjs/common';
import { ReqConsumer } from '@src/consumers/req.consumer';
import { ReqGateway } from '@src/gateways/req.gateway';

@Module({
  controllers: [ReqConsumer],
  providers: [ReqGateway],
})
export class ReqModule {}
