import { EMS_REQUEST_ER, EMS_REQUEST_ER_RESPONSE, EMS_REQUEST_ER_UPDATE } from '@config/constant';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReqGateway } from '@src/gateways/req.gateway';
import { EmsToErRequestMessage } from '@src/types/req.message';

@Controller()
export class ReqConsumer {
  constructor(private readonly reqGateway: ReqGateway) {}

  /**
   * 새로운 요청이 들어왔을 때
   *
   * er에게만 보내줘야함
   */
  @MessagePattern(EMS_REQUEST_ER)
  async handleEmsToErRequest(@Payload() payload: EmsToErRequestMessage.EmsToErReq) {
    const { updated_at } = payload;

    // 메세지 시간이 5분 이내인지 확인
    const now = new Date();
    const messageDate = new Date(updated_at);
    const diff = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diff / 1000 / 60);
    if (diffMinutes > 5) {
      return;
    }
    console.log(payload);
    this.reqGateway.notifyEmsToErNewRequestToEr(payload);
  }

  /**
   * 요청에 대한 응답이 들어왔을 때
   *
   * ems에게만 보내줘야함
   */
  @MessagePattern(EMS_REQUEST_ER_RESPONSE)
  async handleEmsToErResponse(@Payload() payload: EmsToErRequestMessage.EmsToErRes) {
    this.reqGateway.notifyEmsToErReqResponseToEms(payload);
  }

  /**
   * 요청에 대한 업데이트가 들어왔을 때
   * ems와 er 모두에게 보내줘야함
   */
  @MessagePattern(EMS_REQUEST_ER_UPDATE)
  async handleEmsToErUpdate(@Payload() payload: EmsToErRequestMessage.EmsToErUpdate) {
    this.reqGateway.notifyEmsToErUpdateToEmsAndEr(payload);
  }
}
