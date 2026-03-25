import { request } from '../../api/client';
import type { UserSearchResult } from '../../types';

export function searchUsers(q: string): Promise<UserSearchResult[]> {
  return request<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`);
}
