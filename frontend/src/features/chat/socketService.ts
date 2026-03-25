import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

let socket: Socket | null = null;

function connect(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function getSocket(): Socket | null {
  return socket;
}

export const socketService = { connect, disconnect, getSocket };
