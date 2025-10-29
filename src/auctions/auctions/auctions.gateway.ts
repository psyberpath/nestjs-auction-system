import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AuctionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AuctionsGateway');
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('join-auction')
  handleJoinAuction(
    @MessageBody() auctionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `auction: ${auctionId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room ${roomName}`);
    return { event: 'joined-room', data: roomName };
  }
  broadcastNewBid(auctionId: string, bidData: any) {
    const roomName = `auction: ${auctionId}`;
    this.server.to(roomName).emit('new-bid', bidData);
    this.logger.log(`Broadcasting new bid to room ${roomName}`);
  }
}
