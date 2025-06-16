import { Navigate, useRoutes } from 'react-router-dom';
import MainLayout from '../layouts/main';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RoomPage from '../pages/RoomPage';
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'room/:roomCode', element: <RoomPage /> },
      ],
    },
    {
      path: '/login',
      element: (
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      ),
    },
    {
      path: '/register',
      element: (
        <GuestGuard>
          <RegisterPage />
        </GuestGuard>
      ),
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
} 