import { createBrowserRouter } from 'react-router-dom';
// Import your layouts and pages here

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Main Layout Wrapper</div>, // Replace with <MainLayout />
    children: [
      { index: true, element: <div>Landing Page</div> },
      { path: 'about', element: <div>About Page</div> },
    ],
  },
  {
    path: '/app',
    element: <div>App Layout Wrapper</div>, // Replace with <AppLayout />
    children: [
      { index: true, element: <div>Dashboard</div> },
      { path: 'analytics', element: <div>Analytics</div> },
    ],
  },
]);