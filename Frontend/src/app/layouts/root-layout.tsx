import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../../shared/components/ui/Toast';
import { CommandPalette } from '../../shared/components/ui/CommandPalette';

export function RootLayout() {
  return (
    <>
      {/* All your pages will render here */}
      <Outlet /> 
      
      {/* Global UI components now have access to Router context */}
      <ToastContainer />
      <CommandPalette />
    </>
  );
}