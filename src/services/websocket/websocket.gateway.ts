import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*', // Configure CORS options here
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    console.log(`Client ${client.id} joining room: ${room}`);
    client.join(room);
    
    // Verifikasi rooms yang di-subscribe
    const rooms = this.server.sockets.adapter.rooms;
    console.log('Current rooms:', rooms);
}
  afterInit(server: Server) {
    console.log('Socket io server is running');
  }

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);

    client.emit('WELCOME_MESSAGE', 'You are now connected to the WebSocket server!');

  }

  handleDisconnect(client: any) {
    console.log('Client disconnected', client.id);
  }

  emitRecognitionDataAdded(meetingCode: string, userId: string) {
    this.server
      .to(meetingCode)
      .to(`${meetingCode}-${userId}`)
      .emit('RECOGNITION_DATA_ADDED');
  }

  sendRecognitionData(code: string, meetingCode: string) {
    this.server.to(`student-${code}`).emit('SEND_RECOGNITION_DATA', {
      meetingCode,
      datetime: new Date(),
    });
  }
}
