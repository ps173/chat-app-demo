import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import {
  setChatrooms,
  setLoading,
  setError,
  addChatroom,
  setLastMessage,
} from "../chatrooms/chatroomsSlice";
import {
  listChatrooms,
  listDirectRooms,
  joinChatroom,
  createChatroom,
  findOrCreateDirectRoom,
} from "../chatrooms/chatroomsApi";
import { logout } from "../auth/authSlice";
import Avatar from "../../components/Avatar";
import CreateRoomModal from "../chatrooms/CreateRoomModal";
import DiscoverRoomsModal from "../chatrooms/DiscoverRoomsModal";
import { searchUsers } from "../users/usersApi";
import type { UserSearchResult } from "../../types";
import styles from "./layout.module.css";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RoomsSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams<{ roomId?: string }>();

  const user = useAppSelector((s) => s.auth.user);
  const { list, lastMessages } = useAppSelector((s) => s.chatrooms);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(setLoading());
    Promise.all([listChatrooms(), listDirectRooms()])
      .then(([rooms, dms]) => {
        const all = [...rooms, ...dms];
        dispatch(setChatrooms(all));
        all.forEach((room) => {
          const last = room.messages?.[0];
          if (last) {
            dispatch(
              setLastMessage({
                roomId: room.id,
                message: {
                  messageId: last.id,
                  content: last.content,
                  timestamp: last.createdAt,
                  senderName: `${last.sender.firstName} ${last.sender.lastName}`,
                  senderId: "",
                  roomId: room.id,
                },
              }),
            );
          }
        });
      })
      .catch((err) => dispatch(setError((err as Error).message)));
  }, [dispatch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

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
      console.error("Failed to open DM", err);
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
    navigate("/login");
  }

  const isSearching = search.length >= 2;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>My Chats</h1>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                    className={`${styles.roomItem} ${isActive ? styles.active : ""}`}
                    onClick={() => handleRoomClick(room.id)}
                  >
                    <Avatar
                      firstName={room.roomName.split(" ")[0] || " "}
                      lastName={
                        room.roomName.replace(" &", "").split(" ")[1] || " "
                      }
                      size={46}
                      // online
                    />
                    <div className={styles.roomMeta}>
                      <div className={styles.roomTopRow}>
                        <span className={styles.roomItemName}>
                          {room.roomName}
                        </span>
                        {last && (
                          <span className={styles.roomTime}>
                            {formatTime(last.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className={styles.roomBottomRow}>
                        <span className={styles.lastMsg}>
                          {last
                            ? last.content
                            : `by ${room.createdBy.firstName} ${room.createdBy.lastName}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.searchSection}>
              <span className={styles.searchSectionLabel}>People</span>
              {searchLoading && (
                <div className={styles.emptyHint}>Searching…</div>
              )}
              {!searchLoading && userResults.length === 0 && (
                <div className={styles.emptyHint}>No people found</div>
              )}
              {userResults.map((u) => (
                <div
                  key={u.id}
                  className={styles.roomItem}
                  onClick={() => handleUserClick(u.id)}
                >
                  <Avatar
                    firstName={u.firstName}
                    lastName={u.lastName}
                    size={46}
                  />
                  <div className={styles.roomMeta}>
                    <div className={styles.roomTopRow}>
                      <span className={styles.roomItemName}>
                        {u.firstName} {u.lastName}
                      </span>
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
                className={`${styles.roomItem} ${isActive ? styles.active : ""}`}
                onClick={() => handleRoomClick(room.id)}
              >
                <Avatar
                  firstName={room.roomName.split(" ")[0] || " "}
                  lastName={
                    room.roomName.replace(" &", "").split(" ")[1] || " "
                  }
                  size={46}
                  // online
                />
                <div className={styles.roomMeta}>
                  <div className={styles.roomTopRow}>
                    <span className={styles.roomItemName}>{room.roomName}</span>
                    {last && (
                      <span className={styles.roomTime}>
                        {formatTime(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className={styles.roomBottomRow}>
                    <span className={styles.lastMsg}>
                      {last
                        ? last.content
                        : `by ${room.createdBy.firstName} ${room.createdBy.lastName}`}
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
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              size={32}
            />
            <span className={styles.footerName}>
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div className={styles.footerMenuWrap} ref={menuRef}>
            <button
              className={styles.moreBtn}
              onClick={() => setShowMenu((v) => !v)}
              aria-label="More options"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
            {showMenu && (
              <div className={styles.popover}>
                <button
                  className={styles.popoverItem}
                  onClick={() => {
                    setShowModal(true);
                    setShowMenu(false);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Room
                </button>
                <button
                  className={styles.popoverItem}
                  onClick={() => {
                    setShowDiscover(true);
                    setShowMenu(false);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Discover
                </button>
                <div className={styles.popoverDivider} />
                <button
                  className={`${styles.popoverItem} ${styles.danger}`}
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      {showDiscover && (
        <DiscoverRoomsModal onClose={() => setShowDiscover(false)} />
      )}
    </aside>
  );
}
