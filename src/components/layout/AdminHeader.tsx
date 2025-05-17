import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Users, 
  BarChart2, 
  Calendar, 
  FileText, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import logo from '@/assets/images/logo.png';

export default function AdminHeader() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  
  // Fetch the avatar URL on component mount or when user changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.id) return;
      
      setIsLoadingAvatar(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching avatar:', error);
        } else {
          setAvatarUrl(data?.avatar_url || null);
        }
      } catch (error) {
        console.error('Unexpected error fetching avatar:', error);
      } finally {
        setIsLoadingAvatar(false);
      }
    };
    
    fetchAvatar();
  }, [user?.id]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };
  
  const isActive = (tabName: string) => {
    // Extract tab parameter from URL or default to players
    const urlParams = new URLSearchParams(location.search);
    const activeTab = urlParams.get('tab') || 'players';
    
    return activeTab === tabName;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Board FC" className="h-8 w-auto" />
            <span className="font-bold text-xl tracking-tight">Admin Portal</span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="hidden md:flex items-center text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Return to Site
          </Button>
        </div>
        
        {/* Desktop Admin Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/admin/dashboard?tab=players" 
            className={`text-sm font-medium ${isActive('players') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Players</span>
            </div>
          </Link>
          
          <Link 
            to="/admin/dashboard?tab=matches" 
            className={`text-sm font-medium ${isActive('matches') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Fixtures</span>
            </div>
          </Link>
          
          <Link 
            to="/admin/dashboard?tab=news" 
            className={`text-sm font-medium ${isActive('news') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>News</span>
            </div>
          </Link>
          
          <Link 
            to="/admin/dashboard?tab=team_stats" 
            className={`text-sm font-medium ${isActive('team_stats') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span>Stats</span>
            </div>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback>
                      {isLoadingAvatar ? '...' : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/admin/dashboard?tab=settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container py-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/admin/dashboard?tab=players"
              className={`flex items-center gap-2 text-sm font-medium ${isActive('players') ? 'text-primary' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Players</span>
            </Link>
            
            <Link 
              to="/admin/dashboard?tab=matches"
              className={`flex items-center gap-2 text-sm font-medium ${isActive('matches') ? 'text-primary' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              <span>Fixtures</span>
            </Link>
            
            <Link 
              to="/admin/dashboard?tab=news"
              className={`flex items-center gap-2 text-sm font-medium ${isActive('news') ? 'text-primary' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>News</span>
            </Link>
            
            <Link 
              to="/admin/dashboard?tab=team_stats"
              className={`flex items-center gap-2 text-sm font-medium ${isActive('team_stats') ? 'text-primary' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Stats</span>
            </Link>
            
            <div className="pt-2 border-t">
              <Button 
                variant="ghost"
                className="flex items-center text-muted-foreground w-full justify-start"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Return to Site
              </Button>
            </div>
            
            <Button variant="ghost" onClick={handleSignOut} className="justify-start">
              Sign out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
} 