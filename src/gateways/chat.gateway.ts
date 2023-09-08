import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatGatewayClinetQuery {
  er_id: string;
  hospital_name: string;
}
interface ChatGatewayClinetPayload {
  to_er_id: string;
  name: string;
  text: string;
}

@WebSocketGateway({ namespace: 'chat' }) // namespace는 optional 입니다!
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private static readonly logger = new Logger(ChatGateway.name);
  private connectedClients: Map<string, string> = new Map();

  @WebSocketServer()
  server!: Server;

  afterInit() {
    ChatGateway.logger.debug(`Socket Server Init Complete`);
  }

  handleConnection(client: Socket) {
    const { er_id, hospital_name } = client.handshake.query as unknown as ChatGatewayClinetQuery;
    this.connectedClients.set(er_id, client.id);
    console.log(this.connectedClients);
    ChatGateway.logger.debug(`${client.id}(${hospital_name}) is connected!`);
  }

  handleDisconnect(client: Socket) {
    ChatGateway.logger.debug(`${client.id} is disconnected...`);
    const { er_id } = client.handshake.query as unknown as ChatGatewayClinetQuery;

    this.connectedClients.delete(er_id);
    console.log(this.connectedClients);
  }

  @SubscribeMessage('er.message.all')
  handleMessage(client: Socket, payload: { text: string }): void {
    const { er_id, hospital_name } = client.handshake.query as unknown as ChatGatewayClinetQuery;
    const { text } = payload;
    const erInfo = {
      hospital_name,
      er_id,
    };
    this.server.emit('er.message.all', { erInfo, text });
  }

  @SubscribeMessage('er.message.er')
  handleErToER(client: Socket, payload: ChatGatewayClinetPayload) {
    const { er_id, hospital_name } = client.handshake.query as unknown as ChatGatewayClinetQuery;
    const { to_er_id, text } = payload;
    const toSocketId = this.connectedClients.get(to_er_id);
    const erInfo = {
      hospital_name,
      er_id,
    };
    if (toSocketId) {
      this.server.to(toSocketId).emit('er.message.er', { erInfo, text });
    }
  }
}
