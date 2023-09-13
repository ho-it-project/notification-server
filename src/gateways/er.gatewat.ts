import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ClinetQuery {
  er_id: string;
  hospital_name: string;
}

@WebSocketGateway({
  namespace: 'er',
  cors: {
    origin: '*',
  },
}) // namespace는 optional 입니다!
export class ErGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private static readonly logger = new Logger(ErGateway.name);
  private connectedClients: Map<string, string> = new Map();

  @WebSocketServer()
  server!: Server;

  afterInit() {
    ErGateway.logger.debug(`ER Socket Server Init Complete`);
  }

  handleConnection(client: Socket) {
    const { er_id, hospital_name } = client.handshake.query as unknown as ClinetQuery;
    this.connectedClients.set(er_id, client.id);
    ErGateway.logger.debug(`${client.id}(${hospital_name}) is connected!`);
  }

  handleDisconnect(client: Socket) {
    ErGateway.logger.debug(`${client.id} is disconnected...`);
    const { er_id } = client.handshake.query as unknown as ClinetQuery;
    this.connectedClients.delete(er_id);
    console.log(this.connectedClients);
  }

  // @SubscribeMessage('er.changed.status')
  handleErToER(client: Socket, payload: { toErId: string; name: string; text: string }) {
    const erId = client.handshake.query['erId'] as string;
    const { toErId, name, text } = payload;
    const toSocketId = this.connectedClients.get(toErId);
    const erInfo = {
      name,
      erId,
    };
    if (toSocketId) {
      this.server.to(toSocketId).emit('er.message.er', { erInfo, text });
    }
  }

  notifiyErChangedStatus(changedErStatus: { er_id: string; bed_count: number }) {
    console.log(this.connectedClients);
    this.server.emit('er.status', changedErStatus);
  }
}
