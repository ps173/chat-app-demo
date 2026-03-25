export interface JoinRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  content: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface MessageReceivePayload {
  messageId: string;
  senderId: string;
  senderName: string;
  roomId: string;
  content: string;
  timestamp: string;
}
