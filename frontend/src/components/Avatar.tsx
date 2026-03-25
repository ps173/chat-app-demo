import { getAvatarColor, getInitials } from '../utils/avatar';

interface Props {
  firstName: string;
  lastName: string;
  size?: number;
  online?: boolean;
}

export default function Avatar({ firstName, lastName, size = 40, online = false }: Props) {
  const initials = getInitials(firstName, lastName);
  const bg = getAvatarColor(`${firstName}${lastName}`);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: size * 0.35,
          userSelect: 'none',
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: size * 0.28,
            height: size * 0.28,
            background: '#22c55e',
            borderRadius: '50%',
            border: '2px solid #fff',
          }}
        />
      )}
    </div>
  );
}
