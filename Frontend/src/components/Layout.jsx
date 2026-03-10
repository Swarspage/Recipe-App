import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Pages that should take up full height with no container wrapping
const FULLSCREEN_ROUTES = ['/chef'];

const Layout = ({ children }) => {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      {isFullscreen ? (
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      ) : (
        <>
          <main className="flex-grow max-w-container mx-auto w-full px-6 py-8">
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Layout;
