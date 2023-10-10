import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReqGateway } from '@src/gateways/req.gateway';

@Controller()
export class ReqConsumer {
  constructor(private readonly reqGateway: ReqGateway) {}

  @MessagePattern('ems.request.er')
  async handleEmsToErRequest(@Payload() payload: any) {
    const { updated_at } = payload.body;

    // 메세지 시간이 5분 이내인지 확인
    const now = new Date();
    const messageDate = new Date(updated_at);
    const diff = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diff / 1000 / 60);
    if (diffMinutes > 5) {
      return;
    }
    this.reqGateway.notifyEmsToErNewRequest(payload.body);
  }
}
