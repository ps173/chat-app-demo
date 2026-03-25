import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setChatrooms, setLoading, setError } from '../chatrooms/chatroomsSlice';
import { listChatrooms, joinChatroom } from '../chatrooms/chatroomsApi';
import { logout } from '../auth/authSlice';
import Avatar from '../../components/Avatar';
import CreateRoomModal from '../chatrooms/CreateRoomModal';
import { createChatroom } from '../chatrooms/chatroomsApi';
import { addChatroom } from '../chatrooms/chatroomsSlice';
import styles from './layout.module.css';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RoomsSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams<{ roomId?: string }>();

  const user = useAppSelector((s) => s.auth.user);
  const { list, lastMessages } = useAppSelector((s) => s.chatrooms);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(setLoading());
    listChatrooms()
      .then((rooms) => dispatch(setChatrooms(rooms)))
      .catch((err) => dispatch(setError((err as Error).message)));
  }, [dispatch]);

  const filtered = list.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleRoomClick(roomId: string) {
    await joinChatroom(roomId).catch(() => {});
    navigate(`/chatrooms/${roomId}`);
  }

  async function handleCreate(roomName: string) {
    const room = await createChatroom(roomName);
    dispatch(addChatroom(room));
    setShowModal(false);
    await joinChatroom(room.id).catch(() => {});
    navigate(`/chatrooms/${room.id}`);
  }

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>My Chats</h1>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.roomList}>
        {filtered.map((room) => {
          const last = lastMessages[room.id];
          const isActive = room.id === activeRoomId;
          return (
            <div
              key={room.id}
              className={`${styles.roomItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleRoomClick(room.id)}
            >
              <Avatar
                firstName={room.createdBy.firstName}
                lastName={room.createdBy.lastName}
                size={46}
                online
              />
              <div className={styles.roomMeta}>
                <div className={styles.roomTopRow}>
                  <span className={styles.roomItemName}>{room.roomName}</span>
                  {last && <span className={styles.roomTime}>{formatTime(last.timestamp)}</span>}
                </div>
                <div className={styles.roomBottomRow}>
                  <span className={styles.lastMsg}>
                    {last ? last.content : `by ${room.createdBy.firstName} ${room.createdBy.lastName}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {user && (
        <div className={styles.sidebarFooter}>
          <div className={styles.footerUser}>
            <Avatar firstName={user.firstName} lastName={user.lastName} size={32} />
            <span className={styles.footerName}>{user.firstName} {user.lastName}</span>
          </div>
          <div className={styles.footerActions}>
            <button className={`${styles.footerBtn} ${styles.primary}`} onClick={() => setShowModal(true)}>
              + New
            </button>
            <button className={styles.footerBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <CreateRoomModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </aside>
  );
}
