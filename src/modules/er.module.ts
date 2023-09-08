import { Module } from '@nestjs/common';
import { ErController } from '@src/controllers/er.controller';
import { ErGateway } from '@src/gateways/er.gatewat';
import { ErService } from '@src/providers/er.service';

@Module({
  controllers: [ErController],
  providers: [ErGateway, ErService],
})
export class ErModule {}
