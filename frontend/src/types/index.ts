export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Chatroom {
  id: string;
  roomName: string;
  createdById: string;
  createdBy: { firstName: string; lastName: string };
  _count: { participants: number };
}

export interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  roomId: string;
  content: string;
  timestamp: string;
}

export interface Participant {
  userId: string;
  userName: string;
}
