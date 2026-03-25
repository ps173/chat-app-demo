import { request } from '../../api/client';
import type { Chatroom } from '../../types';

export function listChatrooms(): Promise<Chatroom[]> {
  return request<Chatroom[]>('/chatrooms');
}

export function listDirectRooms(): Promise<Chatroom[]> {
  return request<Chatroom[]>('/chatrooms/direct');
}

export function createChatroom(roomName: string): Promise<Chatroom> {
  return request<Chatroom>('/chatrooms', {
    method: 'POST',
    body: JSON.stringify({ roomName }),
  });
}

export function joinChatroom(roomId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/chatrooms/${roomId}/join`, { method: 'POST' });
}

export function leaveChatroom(roomId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/chatrooms/${roomId}/leave`, { method: 'POST' });
}

export function findOrCreateDirectRoom(targetUserId: string): Promise<Chatroom> {
  return request<Chatroom>('/chatrooms/direct', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
}
