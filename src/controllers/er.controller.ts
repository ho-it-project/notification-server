import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Logger } from '@nestjs/common';
import { ChangeErStatusDTO } from '@src/types';
import { ErGateway } from './../gateways/er.gatewat';

@Controller('/er')
export class ErController {
  private readonly logger = new Logger(ErController.name);
  constructor(private readonly erGateway: ErGateway) {}

  @TypedRoute.Put('/status')
  async changeErStatus(@TypedBody() body: ChangeErStatusDTO) {
    this.logger.debug(`change status`);
    this.erGateway.notifiyErChangedStatus(body);
  }
}
