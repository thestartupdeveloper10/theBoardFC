import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Button } from '../ui/button'

export default function Footer() {
  return (
    <footer className="bg-[#034694] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Club Info */}
          <div>
            <img src="https://erpxdjzgbifiebxjgomg.supabase.co/storage/v1/object/public/media/logos/logo.png" alt="The Board FC" className="h-16 mb-6" />
            <div className="space-y-2 text-sm">
              <p>The Board Football Club</p>
              <p>Kenya School of Law stadium</p>
              <p>Nairobi, Kenya</p>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/theboard_fc/" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-primary transition-colors">About The Club</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-lg font-bold mb-4">Staff Area</h3>
            <Button asChild>
              <Link to="/sign-in">Login</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
           
            <p>&copy; {new Date().getFullYear()} The Board FC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 