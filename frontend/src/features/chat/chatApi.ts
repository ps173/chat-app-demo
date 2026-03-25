import { request } from '../../api/client';
import type { Message } from '../../types';

interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

export function getMessages(
  roomId: string,
  limit = 50,
  before?: string,
): Promise<MessagesResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  return request<MessagesResponse>(`/chatrooms/${roomId}/messages?${params}`);
}
