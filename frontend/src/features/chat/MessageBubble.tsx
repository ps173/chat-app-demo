import type { Message } from '../../types';
import styles from './chat.module.css';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`${styles.bubbleWrapper} ${isOwn ? styles.own : styles.other}`}>
      {!isOwn && <span className={styles.senderName}>{message.senderName}</span>}
      <div className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}>
        {message.content}
      </div>
      <span className={styles.timestamp}>{time}</span>
    </div>
  );
}
