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

  @SubscribeMessage('joinOrderRoom')
  handleJoinOrder(client: Socket, orderId: string) {
    const room = `order-${orderId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leaveOrderRoom')
  handleLeaveOrder(client: Socket, orderId: string) {
    const room = `order-${orderId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { success: true };
  }

  @SubscribeMessage('joinSessionRoom')
  handleJoinSession(client: Socket, sessionId: string) {
    const room = `session-${sessionId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined session room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leaveSessionRoom')
  handleLeaveSession(client: Socket, sessionId: string) {
    const room = `session-${sessionId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left session room: ${room}`);
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

  notifyOrderStatusChanged(order: any) {
    this.logger.log(
      `Broadcasting order status changed: ${order._id}, status: ${order.status}`,
    );

    // ส่งการแจ้งเตือนไปยังทุกไคลเอนต์
    this.server.emit('orderStatusChanged', order);

    // ส่งการแจ้งเตือนไปยังห้องของสาขา
    if (order.branchId) {
      const branchId =
        typeof order.branchId === 'object'
          ? order.branchId._id || order.branchId.toString()
          : order.branchId;
      this.server.to(`branch-${branchId}`).emit('orderStatusChanged', order);
    }

    // ส่งการแจ้งเตือนไปยังห้องของเซสชัน
    if (order.sessionId) {
      const sessionId =
        typeof order.sessionId === 'object'
          ? order.sessionId._id || order.sessionId.toString()
          : order.sessionId;
      this.server.to(`session-${sessionId}`).emit('orderStatusChanged', order);
    }

    // ส่งการแจ้งเตือนไปยังห้องของออร์เดอร์
    this.server.to(`order-${order._id}`).emit('orderStatusChanged', order);
  }

  notifyPaymentStatusChanged(payment: any) {
    this.logger.log(
      `Broadcasting payment status changed: ${payment._id}, status: ${payment.status}`,
    );

    // ส่งการแจ้งเตือนไปยังทุกไคลเอนต์
    this.server.emit('paymentStatusChanged', payment);

    // ส่งการแจ้งเตือนไปยังห้องของสาขา
    if (payment.branchId) {
      const branchId =
        typeof payment.branchId === 'object'
          ? payment.branchId._id || payment.branchId.toString()
          : payment.branchId;
      this.server
        .to(`branch-${branchId}`)
        .emit('paymentStatusChanged', payment);
    }

    // ส่งการแจ้งเตือนไปยังห้องของ order
    if (payment.orderId) {
      const orderId =
        typeof payment.orderId === 'object'
          ? payment.orderId._id || payment.orderId.toString()
          : payment.orderId;
      this.server.to(`order-${orderId}`).emit('paymentStatusChanged', payment);
    }
  }

  notifySessionCheckout(session: any) {
    this.logger.log(`Broadcasting session checkout: ${session._id}`);

    // ส่งการแจ้งเตือนไปยังทุกไคลเอนต์
    this.server.to(`session-${session._id}`).emit('sessionCheckout', session);

    // ส่งการแจ้งเตือนไปยังห้องของสาขา
    if (session.branchId) {
      const branchId =
        typeof session.branchId === 'object'
          ? session.branchId._id || session.branchId.toString()
          : session.branchId;
      this.server.to(`branch-${branchId}`).emit('sessionCheckout', session);
    }
  }
}
