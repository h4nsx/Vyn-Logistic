import { Outlet } from 'react-router-dom';
import { Navbar } from '../../shared/components/layout/Navbar';
import { Footer } from '../../shared/components/layout/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20"> {/* pt-20 offsets the fixed navbar */}
        <Outlet />
      </main>

        <Footer />
    </div>
  );
}

export default MainLayout;