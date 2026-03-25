import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setChatrooms, setLoading, setError, addChatroom } from '../chatrooms/chatroomsSlice';
import { listChatrooms, listDirectRooms, joinChatroom, createChatroom, findOrCreateDirectRoom } from '../chatrooms/chatroomsApi';
import { logout } from '../auth/authSlice';
import Avatar from '../../components/Avatar';
import CreateRoomModal from '../chatrooms/CreateRoomModal';
import { searchUsers } from '../users/usersApi';
import type { UserSearchResult } from '../../types';
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
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(setLoading());
    Promise.all([listChatrooms(), listDirectRooms()])
      .then(([rooms, dms]) => dispatch(setChatrooms([...rooms, ...dms])))
      .catch((err) => dispatch(setError((err as Error).message)));
  }, [dispatch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filtered = list.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    setUserResults([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(val);
        setUserResults(results);
      } catch {
        setUserResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }

  async function handleRoomClick(roomId: string) {
    await joinChatroom(roomId).catch(() => {});
    navigate(`/chatrooms/${roomId}`);
  }

  async function handleUserClick(targetUserId: string) {
    try {
      const room = await findOrCreateDirectRoom(targetUserId);
      dispatch(addChatroom(room));
      navigate(`/chatrooms/${room.id}`);
    } catch (err) {
      console.error('Failed to open DM', err);
    }
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

  const isSearching = search.length >= 2;

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
            placeholder="Search rooms or people..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className={styles.roomList}>
        {isSearching ? (
          <>
            <div className={styles.searchSection}>
              <span className={styles.searchSectionLabel}>Rooms</span>
              {filtered.length === 0 && (
                <div className={styles.emptyHint}>No rooms match</div>
              )}
              {filtered.map((room) => {
                const last = lastMessages[room.id];
                const isActive = room.id === activeRoomId;
                return (
                  <div
                    key={room.id}
                    className={`${styles.roomItem} ${isActive ? styles.active : ''}`}
                    onClick={() => handleRoomClick(room.id)}
                  >
                    <Avatar firstName={room.createdBy.firstName} lastName={room.createdBy.lastName} size={46} online />
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

            <div className={styles.searchSection}>
              <span className={styles.searchSectionLabel}>People</span>
              {searchLoading && <div className={styles.emptyHint}>Searching…</div>}
              {!searchLoading && userResults.length === 0 && (
                <div className={styles.emptyHint}>No people found</div>
              )}
              {userResults.map((u) => (
                <div
                  key={u.id}
                  className={styles.roomItem}
                  onClick={() => handleUserClick(u.id)}
                >
                  <Avatar firstName={u.firstName} lastName={u.lastName} size={46} />
                  <div className={styles.roomMeta}>
                    <div className={styles.roomTopRow}>
                      <span className={styles.roomItemName}>{u.firstName} {u.lastName}</span>
                    </div>
                    <div className={styles.roomBottomRow}>
                      <span className={styles.lastMsg}>{u.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          filtered.map((room) => {
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
          })
        )}
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
