import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../lib/axios';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const client = io('http://localhost:5000', {
      transports: ['websocket'],
    });
    setSocket(client);

    client.on('connect', () => {
      api.get('/auth/me').then((response) => {
        if (response.data.user?.role === 'student') {
          client.emit('join:student', response.data.user.id);
        }
      }).catch(() => {
        // ignore authentication error for socket join
      });
    });

    return () => {
      client.disconnect();
    };
  }, []);

  return socket;
}
