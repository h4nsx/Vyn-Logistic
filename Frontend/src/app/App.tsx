// src/app/App.tsx
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import { router } from './router';

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}