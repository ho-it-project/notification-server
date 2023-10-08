import { SubscribeTo, SubscribeToFixedGroup } from '@common/kafka/kafka.decorator';
import { Controller } from '@nestjs/common';

@Controller()
export class ReqConsumer {
  constructor() {}

  @SubscribeToFixedGroup('ems.request.er')
  async handleEmsToErRequest(payload: any) {
    console.log(payload);
  }

  @SubscribeTo('er.response.ems')
  async handlerErToEmsResponse(payload: any) {
    console.log(payload);
  }
}
