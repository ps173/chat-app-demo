import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setChatrooms, addChatroom, setLoading, setError } from './chatroomsSlice';
import { listChatrooms, createChatroom, joinChatroom } from './chatroomsApi';
import { logout } from '../auth/authSlice';
import CreateRoomModal from './CreateRoomModal';
import styles from './chatrooms.module.css';

export default function ChatroomsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, status } = useAppSelector((s) => s.chatrooms);
  const user = useAppSelector((s) => s.auth.user);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(setLoading());
    listChatrooms()
      .then((rooms) => dispatch(setChatrooms(rooms)))
      .catch((err) => dispatch(setError((err as Error).message)));
  }, [dispatch]);

  async function handleJoin(roomId: string) {
    await joinChatroom(roomId);
    navigate(`/chatrooms/${roomId}`);
  }

  async function handleCreate(roomName: string) {
    const room = await createChatroom(roomName);
    dispatch(addChatroom(room));
    setShowModal(false);
    await joinChatroom(room.id);
    navigate(`/chatrooms/${room.id}`);
  }

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chatrooms</h1>
        <div className={styles.headerActions}>
          {user && (
            <span className={styles.userName}>
              {user.firstName} {user.lastName}
            </span>
          )}
          <button className={styles.createBtn} onClick={() => setShowModal(true)}>
            + Create Room
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {status === 'loading' && <p className={styles.empty}>Loading rooms…</p>}

      {status !== 'loading' && list.length === 0 && (
        <p className={styles.empty}>No chatrooms yet. Create the first one!</p>
      )}

      <div className={styles.list}>
        {list.map((room) => (
          <div key={room.id} className={styles.room}>
            <div className={styles.roomInfo}>
              <span className={styles.roomName}>{room.roomName}</span>
              <span className={styles.roomMeta}>
                Created by {room.createdBy.firstName} {room.createdBy.lastName}
                <span className={styles.badge}>{room._count.participants} online</span>
              </span>
            </div>
            <button className={styles.joinBtn} onClick={() => handleJoin(room.id)}>
              Join
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateRoomModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
