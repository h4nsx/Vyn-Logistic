import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/main-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { AppLayout } from '../layouts/app-layout';
import { RootLayout } from '../layouts/root-layout'; 

// Public Pages
import { LoginPage } from '../../pages/public/auth/login.page';
import { RegisterPage } from '../../pages/public/auth/register.page';
import { ForgotPasswordPage } from '../../pages/public/auth/forgot-password.page';
import { ResetPasswordPage } from '../../pages/public/auth/reset-password.page';
import { HomePage } from '../../pages/public/home.page';

// App (Protected) Pages
import { DashboardPage } from '../../pages/app/dashboard.page';
import { UploadPage } from '../../pages/app/upload.page';
import { DatasetDetailPage } from '../../pages/app/{datasets}/dataset-detail.page';
import { AnalyticsPage } from '../../pages/app/analytics.page';
import { DatasetsPage } from '../../pages/app/{datasets}/datasets.page';
import { SettingsPage } from '../../pages/app/settings.page';

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // Wrap everything in RootLayout
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'upload', element: <UploadPage /> },
          { path: 'datasets', element: <DatasetsPage /> },
          { path: 'datasets/:id', element: <DatasetDetailPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);