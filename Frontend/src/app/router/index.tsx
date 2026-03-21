import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/main-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { AppLayout } from '../layouts/app-layout';

// Public Pages
import { LoginPage } from '../../pages/public/auth/login.page';
import { RegisterPage } from '../../pages/public/auth/register.page';

// App (Protected) Pages
import { DashboardPage } from '../../pages/app/dashboard.page';
import { UploadPage } from '../../pages/app/upload.page';
import { DatasetDetailPage } from '../../pages/app/{datasets}/dataset-detail.page';
import { AnalyticsPage } from '../../pages/app/analytics.page';
import { DatasetsPage } from '../../pages/app/{datasets}/datasets.page';

export const router = createBrowserRouter([

  {
    path: '/',
    element: <MainLayout />,
    children: [
      { 
        index: true, 
        element: (
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl font-bold text-navy">Vynlytics</h1>
            <p className="text-content-secondary mt-4 text-xl">Detect. Diagnose. Deliver.</p>
          </div>
        ) 
      },
      // Add other public pages like /about, /solutions here
    ],
  },

  // 2. Authentication Routes
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // 3. Protected App Routes
  {
    path: '/app',
    element: <AppLayout />, // This layout handles the Sidebar and Auth Guard
    children: [
      { 
        index: true, 
        element: <DashboardPage /> 
      },
      { 
        path: 'upload', 
        element: <UploadPage /> 
      },
      { 
        path: 'datasets/:id', 
        element: <DatasetDetailPage /> 
      },
      { 
        path: 'datasets', 
        element: <DatasetsPage /> 
      },
      { 
        path: 'analytics', 
        element: <AnalyticsPage />
      },
      { 
        path: 'settings', 
        element: <div className="p-8 text-navy font-bold">User Settings (Coming Soon)</div> 
      },
    ],
  },

  // 4. Fallback / 404
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);