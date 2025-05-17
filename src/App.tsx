import {   BrowserRouter,Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/Home';
import SignIn from '@/pages/SignIn';
import AdminDashboard from '@/pages/admin/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import Team from './pages/Team';
import PlayerStats from './pages/PlayerStats';
import Fixtures from './pages/Fixtures';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import SignUp from './components/auth/SignUp';
import { PlayerStatsManagement } from './pages/admin/PlayerStatsManagement';
import AdminLayout from './components/layout/AdminLayout';
import AdminNewsDetail from './pages/admin/NewsDetail';
import ScrollToTop from './components/ScrollToTop';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
     
     <ScrollToTop />
      <Routes>
        
        {/* Auth routes (no header/footer) */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Admin routes with admin layout */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/players/:playerId/stats" element={<PlayerStatsManagement />} />
            <Route path="/admin/news/:id" element={<AdminNewsDetail />} />
          </Route>
        </Route>
        
        {/* Public routes with standard layout */}
        <Route path="/*" element={<StandardLayout />} />
      </Routes>
      
      <Toaster />
    </AuthProvider>
  );
}

// Standard layout with regular header and footer
function StandardLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/player/:playerId" element={<PlayerStats />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          {/* Add a catch-all route to handle 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Simple 404 page
function NotFound() {
  return (
    <div className="container mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-8">Sorry, the page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">
        Return to Home
      </a>
    </div>
  );
}

export default App; 