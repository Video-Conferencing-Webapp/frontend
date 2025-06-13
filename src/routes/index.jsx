import { useRoutes, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RoomPage from "../pages/RoomPage";
import GuestGuard from "../guards/GuestGuard";
import AuthGuard from "../guards/AuthGuard";
import MainLayout from "../layouts/main";

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: (
        <AuthGuard>
          <MainLayout>
            <HomePage />
          </MainLayout>
        </AuthGuard>
      ),
    },
    {
      path: "/login",
      element: (
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      ),
    },
    {
      path: "/register",
      element: (
        <GuestGuard>
          <RegisterPage />
        </GuestGuard>
      ),
    },
    {
      path: "/room/:roomCode",
      element: (
        <AuthGuard>
          <MainLayout>
            <RoomPage />
          </MainLayout>
        </AuthGuard>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ]);
} 