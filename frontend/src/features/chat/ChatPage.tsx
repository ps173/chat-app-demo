import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setMessages, setLoading, clearRoom } from './chatSlice';
import { getMessages } from './chatApi';
import { leaveChatroom } from '../chatrooms/chatroomsApi';
import { useSocket } from './useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './chat.module.css';

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((s) => s.auth.user);
  const activeRoom = useAppSelector((s) => s.chat.activeRoom);
  const { messages, participants, status } = useAppSelector((s) => s.chat);

  const { sendMessage } = useSocket(roomId!);

  useEffect(() => {
    dispatch(setLoading());
    getMessages(roomId!)
      .then((res) => dispatch(setMessages(res)))
      .catch(() => dispatch(setMessages({ messages: [], nextCursor: null })));

    return () => {
      dispatch(clearRoom());
    };
  }, [roomId, dispatch]);

  async function handleLeave() {
    await leaveChatroom(roomId!);
    navigate('/chatrooms');
  }

  if (!user) return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.roomLabel}>Room</span>
          <span className={styles.roomName}>
            {activeRoom?.roomName ?? '…'}
          </span>
        </div>

        <div>
          <p className={styles.sectionTitle}>Participants ({participants.length})</p>
          <div className={styles.participantList}>
            {participants.map((p) => (
              <div key={p.userId} className={styles.participant}>
                <div className={styles.avatar}>
                  {p.userName.charAt(0).toUpperCase()}
                </div>
                {p.userName}
              </div>
            ))}
          </div>
        </div>

        <button className={styles.leaveBtn} onClick={handleLeave}>
          Leave Room
        </button>
      </aside>

      <main className={styles.main}>
        {status === 'loading' ? (
          <div className={styles.loading}>Loading messages…</div>
        ) : (
          <MessageList messages={messages} currentUserId={user.id} />
        )}
        <MessageInput onSend={sendMessage} />
      </main>
    </div>
  );
}
