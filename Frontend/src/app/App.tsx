import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import { router } from './router';

export function App() {
  return (
    <QueryProvider>
      {/* Add ThemeProvider, AuthProvider, etc. here */}
      <RouterProvider router={router} />
    </QueryProvider>
  );
}