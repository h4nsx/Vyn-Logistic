import { Outlet } from 'react-router-dom';
import { Navbar } from '../../shared/components/layout/Navbar';
import { Footer } from '../../shared/components/layout/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow"> {/* Navbar is fixed/overlay — pages handle their own top spacing */}
        <Outlet />
      </main>

        <Footer />
    </div>
  );
}

export default MainLayout;