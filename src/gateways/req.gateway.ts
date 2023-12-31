import { EMS_REQUEST_ER, EMS_REQUEST_ER_RESPONSE, EMS_REQUEST_ER_UPDATE } from '@config/constant';
import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EmsToErRequestMessage } from '@src/types/req.message';
import { Server, Socket } from 'socket.io';
import { AuthService } from './../auth/provider/common.auth.service';

@WebSocketGateway({
  namespace: 'request',
  cors: {
    origin: '*',
  },
}) // namespace는 optional 입니다!
@Injectable()
export class ReqGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(ReqGateway.name);
  // emergency_center_id: socket_id[]
  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.debug(`Request Socket Server Init Complete`);
  }

  async handleConnection(client: Socket) {
    const token: string = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return;
    }

    const isValidToken = this.authService.tokenVerify(token);
    if (!isValidToken) {
      client.disconnect();
      return;
    }
    console.log(isValidToken);
    const { type } = isValidToken;
    if (type === 'ems') {
      const { ambulance_company_id, employee_id } = isValidToken;
      await client.join(`request-ems-${ambulance_company_id}-${employee_id}`);
      this.logger.debug(`ems request-${client.id} is connected! ${ambulance_company_id}:${employee_id}`);
    }

    if (type === 'er') {
      const { emergency_center_id, employee_id } = isValidToken;
      await client.join(`request-er-${emergency_center_id}`);
      this.logger.debug(`er request-${client.id} is connected! ${emergency_center_id}:${employee_id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`${client.id} is disconnected...`);
    // const { emergency_center_id } = client.handshake.query as unknown as ClinetQuery;
  }

  notifyEmsToErNewRequestToEr(payload: EmsToErRequestMessage.EmsToErReq) {
    this.server.to(`request-er-${payload.emergency_center_id}`).emit(EMS_REQUEST_ER, payload);
  }

  notifyEmsToErNewRequestToErForEms(payload: EmsToErRequestMessage.EmsToErReq) {
    const { patient } = payload;
    const { ambulance_company_id, ems_employee_id } = patient;
    this.server.to(`request-ems-${ambulance_company_id}-${ems_employee_id}`).emit(EMS_REQUEST_ER, payload);
  }

  notifyEmsToErReqResponseToEms(payload: EmsToErRequestMessage.EmsToErRes) {
    this.server
      .to(`request-ems-${payload.ambulance_company_id}-${payload.ems_employee_id}`)
      .emit(EMS_REQUEST_ER_RESPONSE, payload);
  }

  notifyEmsToErUpdateToEmsAndEr(payload: EmsToErRequestMessage.EmsToErUpdate) {
    const { request_status } = payload;
    if (request_status === 'TRANSFER_COMPLETED' || request_status === 'TRANSFER')
      // 요청이 완료되었을 때는 er에게도 보내줌
      this.server.to(`request-er-${payload.emergency_center_id}`).emit(EMS_REQUEST_ER_UPDATE, payload);
    if (request_status !== 'TRANSFER_COMPLETED' && request_status !== 'TRANSFER')
      // 요청이 완료정보는 ems에 보낼 필요가 없음
      this.server
        .to(`request-ems-${payload.ambulance_company_id}-${payload.ems_employee_id}`)
        .emit(EMS_REQUEST_ER_UPDATE, payload);
  }
}
