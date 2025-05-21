import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Sun, Moon } from 'lucide-react';

import logo from '@/assets/images/logo.png'

// Animation variants
const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const navItemVariants = {
  hover: { scale: 1.05, x: 10, transition: { duration: 0.2 } },
  initial: { scale: 1, x: 0 }
};

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const getDashboardUrl = () => {
    return isAdmin ? '/admin/dashboard' : '/player/dashboard';
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="container flex h-16 items-center justify-between"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <Link to="/" className="flex items-center">
            <motion.img 
              src={`${logo}`} 
              alt="Board FC" 
              className="h-24 w-auto -mb-5"
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            />
            <motion.span 
              className="text-xl font-bold hidden md:block tracking-tight"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              Board FC
            </motion.span>
          </Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { to: "/", label: "Home" },
            { to: "/team", label: "Team" },
            { to: "/fixtures", label: "Fixtures" },
            { to: "/news", label: "News" },
            { to: "/fanzone", label: "Fan Zone" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((item) => (
            <motion.div
              key={item.to}
              variants={navItemVariants}
              whileHover="hover"
              initial="initial"
            >
              <Link 
                to={item.to} 
                className="text-sm font-medium hover:text-primary relative group"
              >
                {item.label}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.div>
          ))}
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="rounded-full"
            >
              <motion.div
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(getDashboardUrl())}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/sign-in">Login</Link>
            </Button>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="rounded-full"
            >
              <motion.div
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden container py-4 overflow-hidden"
          >
            <nav className="flex flex-col space-y-4">
              {[
                { to: "/", label: "Home" },
                { to: "/team", label: "Team" },
                { to: "/fixtures", label: "Fixtures" },
                { to: "/news", label: "News" },
                { to: "/fanzone", label: "Fan Zone" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.to}
                    className="text-sm font-medium block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              {user ? (
                <>
                  <Link to={getDashboardUrl()} className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Button variant="ghost" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 