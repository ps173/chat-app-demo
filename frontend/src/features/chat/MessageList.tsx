import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import MessageBubble from './MessageBubble';
import styles from './chat.module.css';

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.messageList}>
      {messages.map((msg) => (
        <MessageBubble key={msg.messageId} message={msg} isOwn={msg.senderId === currentUserId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
