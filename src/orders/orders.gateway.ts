import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'orders',
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('OrdersGateway');

  afterInit() {
    this.logger.log('Orders WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBranchRoom')
  handleJoinBranch(client: Socket, branchId: string) {
    const room = `branch-${branchId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leaveBranchRoom')
  handleLeaveBranch(client: Socket, branchId: string) {
    const room = `branch-${branchId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { success: true };
  }

  notifyNewOrder(order: any) {
    this.logger.log(`Broadcasting new order: ${order._id}`);
    this.server.emit('newOrder', order);
  }

  notifyNewOrderToBranch(branchId: string, order: any) {
    this.logger.log(`Broadcasting new order to branch: ${branchId}`);
    this.server.to(`branch-${branchId}`).emit('newOrder', order);
  }
}
