import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
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

  afterInit(server: Server) {
    console.log('Socket io server is running');
  }

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected', client.id);
  }

  emitRecognitionDataAdded(emoviewCode: string, userId: string) {
    this.server
      .to(emoviewCode)
      .to(`${emoviewCode}-${userId}`)
      .emit('RECOGNITION_DATA_ADDED');
  }

  sendRecognitionData(code: string, emoviewCode: string) {
    this.server.to(`student-${code}`).emit('SEND_RECOGNITION_DATA', {
      emoviewCode,
      datetime: new Date(),
    });
  }
}
