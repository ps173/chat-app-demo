import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setMessages, setLoading, clearRoom } from './chatSlice';
import { setLastMessage } from '../chatrooms/chatroomsSlice';
import { getMessages } from './chatApi';
import { useSocket } from './useSocket';
import Avatar from '../../components/Avatar';
import styles from './layout.module.css';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

export default function ChatPanel() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const { messages, status } = useAppSelector((s) => s.chat);
  const room = useAppSelector((s) => s.chatrooms.list.find((r) => r.id === roomId));

  const { sendMessage } = useSocket(roomId!);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    dispatch(setLoading());
    getMessages(roomId!)
      .then((res) => dispatch(setMessages(res)))
      .catch(() => dispatch(setMessages({ messages: [], nextCursor: null })));
    return () => { dispatch(clearRoom()); };
  }, [roomId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setValue('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  if (!user) return null;

  // Group messages by date for separators
  const groups: { date: string; label: string }[] = [];
  const seenDates = new Set<string>();
  messages.forEach((msg) => {
    const dateKey = new Date(msg.timestamp).toDateString();
    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey);
      groups.push({ date: dateKey, label: formatDateLabel(msg.timestamp) });
    }
  });

  return (
    <>
      {/* Header */}
      <div className={styles.chatHeader}>
        {room && (
          <Avatar
            firstName={room.createdBy.firstName}
            lastName={room.createdBy.lastName}
            size={38}
            online
          />
        )}
        <div>
          <div className={styles.chatHeaderName}>{room?.roomName ?? '…'}</div>
          <div className={styles.chatHeaderSub}>
            {room ? `Created by ${room.createdBy.firstName} ${room.createdBy.lastName}` : ''}
          </div>
        </div>
      </div>

      {/* Messages */}
      {status === 'loading' ? (
        <div className={styles.loading}>Loading messages…</div>
      ) : (
        <div className={styles.messages}>
          {(() => {
            const seenForRender = new Set<string>();
            return messages.map((msg) => {
              const dateKey = new Date(msg.timestamp).toDateString();
              const showSeparator = !seenForRender.has(dateKey);
              if (showSeparator) seenForRender.add(dateKey);
              const isOwn = msg.senderId === user.id;
              return (
                <div key={msg.messageId}>
                  {showSeparator && (
                    <div className={styles.dateSeparator}>
                      {formatDateLabel(msg.timestamp)}
                    </div>
                  )}
                  <div className={`${styles.bubbleWrapper} ${isOwn ? styles.own : styles.other}`}>
                    {!isOwn && <span className={styles.senderName}>{msg.senderName}</span>}
                    <div className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}>
                      {msg.content}
                    </div>
                    <span className={styles.bubbleTime}>{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              );
            });
          })()}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input bar */}
      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <div className={styles.inputWrap}>
          <button type="button" className={styles.iconBtn} tabIndex={-1}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <input
            className={styles.messageInput}
            type="text"
            placeholder="Write your message..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className={styles.iconBtn} tabIndex={-1}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
        <button type="submit" className={styles.sendBtn} disabled={!value.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </>
  );
}
