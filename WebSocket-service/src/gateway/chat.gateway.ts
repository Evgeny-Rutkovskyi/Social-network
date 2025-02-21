import {
  ConnectedSocket, MessageBody, OnGatewayConnection,
  OnGatewayDisconnect, SubscribeMessage,
  WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io'
import {
  AccessInfo, ClientToServerEvents, DeleteMessage,
  EditMessage, ForwardMessage, JoinRoom, Message,
  ReplyMessage, ServerToClientEvents
} from 'src/interfaces/chat.interface';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer() server: Server = new Server<ClientToServerEvents, ServerToClientEvents>();
  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join_room')
  async handleJoinRoom(@MessageBody() payload: JoinRoom){
    const access: AccessInfo = await this.chatService.checkAccessToRoom(payload);
    if(access.permission){
      this.server.in(payload.socketId).socketsJoin(String(payload.chat_id));
      this.server.to(payload.socketId).emit('last_messages', access.messages);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() payload: Message){
    this.server.to(String(payload.chatId)).emit('message', payload)
    await this.chatService.saveMessage(payload);
  }

  @SubscribeMessage('edit')
  async handleEditMessage(@MessageBody() payload: EditMessage){
    const success: boolean = await this.chatService.editMessage(payload);
    if(success){
      this.server.to(String(payload.chatId)).emit('edit', payload);
    }
  }

  @SubscribeMessage('reply')
  async handleReplyMessage(@MessageBody() payload: ReplyMessage){
    this.server.to(String(payload.chatId)).emit('reply', payload);
    await this.chatService.replyMessage(payload);
  }

  @SubscribeMessage('forward')
  async handleForwardMessage(@MessageBody() payload: ForwardMessage){
    this.server.to(payload.chatsId).emit('message', payload.forward)
    if(payload.message) this.server.to(payload.chatsId).emit('message', payload.message);
    await this.chatService.forwardMessage(payload);
  }

  @SubscribeMessage('delete')
  async handleDeleteMessage(@MessageBody() payload: DeleteMessage){
    this.server.to(String(payload.chatId)).emit('delete', {deleted_message: payload.messageId});
    await this.chatService.deleteMessage(payload);
  }

  handleConnection(client: Socket) {
    console.log(`Client ${client.id} connected`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client ${client} disconnected`);
    client.rooms.forEach((room) => {
      if(room !== client.id) client.leave(room);
    })
  }
}
