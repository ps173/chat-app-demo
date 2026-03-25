import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addChatroom } from './chatroomsSlice';
import { discoverChatrooms, joinChatroom } from './chatroomsApi';
import type { Chatroom } from '../../types';
import styles from './chatrooms.module.css';

interface Props {
  onClose: () => void;
}

export default function DiscoverRoomsModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Chatroom[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchRooms('');
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function fetchRooms(query: string) {
    setLoading(true);
    try {
      const results = await discoverChatrooms(query || undefined);
      setRooms(results);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchRooms(val), 300);
  }

  async function handleJoin(room: Chatroom) {
    setJoiningId(room.id);
    try {
      await joinChatroom(room.id);
      dispatch(addChatroom(room));
      onClose();
      navigate(`/chatrooms/${room.id}`);
    } catch {
      setJoiningId(null);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.discoverModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.discoverHeader}>
          <h2 className={styles.modalTitle}>Discover Rooms</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.discoverSearchWrap}>
          <input
            type="text"
            placeholder="Search rooms…"
            value={search}
            onChange={handleSearchChange}
            autoFocus
            className={styles.discoverSearchInput}
          />
        </div>

        <div className={styles.discoverList}>
          {loading && <p className={styles.discoverHint}>Loading…</p>}
          {!loading && rooms.length === 0 && (
            <p className={styles.discoverHint}>No rooms available to join.</p>
          )}
          {!loading && rooms.map((room) => (
            <div key={room.id} className={styles.discoverItem}>
              <div className={styles.discoverItemInfo}>
                <span className={styles.discoverItemName}>{room.roomName}</span>
                <span className={styles.discoverItemMeta}>
                  by {room.createdBy.firstName} {room.createdBy.lastName}
                  &nbsp;·&nbsp;{room._count.participants} member{room._count.participants !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className={styles.joinBtn}
                disabled={joiningId === room.id}
                onClick={() => handleJoin(room)}
              >
                {joiningId === room.id ? 'Joining…' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
