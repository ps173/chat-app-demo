import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { socketService } from './socketService';
import { addMessage, addParticipant, removeParticipant, setError } from './chatSlice';
import { setLastMessage } from '../chatrooms/chatroomsSlice';
import type { Message, Participant } from '../../types';

export function useSocket(roomId: string) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);

    socket.emit('room:join', { roomId });

    socket.on('message:receive', (msg: Message) => {
      dispatch(addMessage(msg));
      dispatch(setLastMessage({ roomId: msg.roomId, message: msg }));
    });

    socket.on(
      'room:user_joined',
      (payload: { roomId: string; userId: string; userName: string }) => {
        if (payload.roomId === roomId) {
          dispatch(addParticipant({ userId: payload.userId, userName: payload.userName }));
        }
      },
    );

    socket.on('room:user_left', (payload: { roomId: string; userId: string }) => {
      if (payload.roomId === roomId) {
        dispatch(removeParticipant({ userId: payload.userId }));
      }
    });

    socket.on('error', (err: { code: string; message: string }) => {
      dispatch(setError(err.message));
    });

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('message:receive');
      socket.off('room:user_joined');
      socket.off('room:user_left');
      socket.off('error');
    };
  }, [roomId, token, dispatch]);

  function sendMessage(content: string) {
    const socket = socketService.getSocket();
    socket?.emit('message:send', { roomId, content });
  }

  return { sendMessage };
}

export type { Participant };
