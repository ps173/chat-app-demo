import { useParams } from 'react-router-dom';
import RoomsSidebar from './RoomsSidebar';
import ChatPanel from './ChatPanel';
import styles from './layout.module.css';

export default function ChatLayout() {
  const { roomId } = useParams<{ roomId?: string }>();

  return (
    <div className={styles.shell}>
      <RoomsSidebar />
      <main className={styles.panel}>
        {roomId ? (
          <ChatPanel key={roomId} />
        ) : (
          <div className={styles.emptyPanel}>
            <span className={styles.emptyIcon}>💬</span>
            <span>Select a room to start chatting</span>
          </div>
        )}
      </main>
    </div>
  );
}
