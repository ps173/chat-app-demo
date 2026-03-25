import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/useAppDispatch';
import PrivateRoute from './routes/PrivateRoute';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ChatLayout from './features/chat/ChatLayout';

export default function App() {
  const token = useAppSelector((s) => s.auth.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? '/chatrooms' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/chatrooms" element={<ChatLayout />} />
          <Route path="/chatrooms/:roomId" element={<ChatLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
