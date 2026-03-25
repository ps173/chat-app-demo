import { useState, type FormEvent } from 'react';
import styles from './chatrooms.module.css';

interface Props {
  onClose: () => void;
  onCreate: (roomName: string) => Promise<void>;
}

export default function CreateRoomModal({ onClose, onCreate }: Props) {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onCreate(roomName.trim());
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Create a Room</h2>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Room name"
            required
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.createBtn} disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
