import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RequestMessage } from '@src/types/req.message';
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
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      client.disconnect();
      return;
    }
    const isValidCookie = this.authService.cookieVerify(cookies);
    if (!isValidCookie) {
      client.disconnect();
      return;
    }
    const { type } = isValidCookie;
    if (type === 'ems') {
      const { ambulance_company_id, employee_id } = isValidCookie;
      await client.join(`request-ems-${ambulance_company_id}-${employee_id}`);
      this.logger.debug(`ems request-${client.id} is connected! ${ambulance_company_id}:${employee_id}`);
    }

    if (type === 'er') {
      const { emergency_center_id, employee_id } = isValidCookie;
      await client.join(`request-er-${emergency_center_id}`);
      this.logger.debug(`er request-${client.id} is connected! ${emergency_center_id}:${employee_id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`${client.id} is disconnected...`);
    // const { emergency_center_id } = client.handshake.query as unknown as ClinetQuery;
  }

  notifyErChangedStatus(changedErStatus: { er_id: string; bed_count: number }) {
    this.server.emit('er.status', changedErStatus);
  }

  notifyErChangedStatusByErId(er_id: string, bed_count: number) {
    this.server.emit('er.status', { er_id, bed_count });
  }

  notifyEmsToErNewRequest(payload: RequestMessage.EmsToEr) {
    this.server.to(`request-er-${payload.emergency_center_id}`).emit('ems.request.er', payload);
  }
}
