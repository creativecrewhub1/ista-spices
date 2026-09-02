import { Link } from 'react-router-dom'
import { Share2, Globe, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'

export function SpicestFooter() {
  return (
    <footer className="bg-[#1C130A] text-amber-50/90 pt-16 pb-12 border-t border-amber-950/40" id="footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/shop" className="flex items-center gap-2">
              <span className="font-display text-2xl font-extrabold tracking-wider text-[#E85D19]">
                SPICEST
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed max-w-sm">
              Through our passion for authentic flavors, we bring you world-class single-origin spices, hand-harvested herbs, and traditional cold-pressed oils.
            </p>
            <div className="flex items-center space-x-3 text-amber-200/70 pt-2">
              <a href="#" aria-label="Social Share" className="p-2 rounded-full bg-amber-900/40 hover:bg-[#E85D19] hover:text-white transition-colors">
                <Share2 className="size-4" />
              </a>
              <a href="#" aria-label="Global Site" className="p-2 rounded-full bg-amber-900/40 hover:bg-[#E85D19] hover:text-white transition-colors">
                <Globe className="size-4" />
              </a>
              <a href="#" aria-label="Community" className="p-2 rounded-full bg-amber-900/40 hover:bg-[#E85D19] hover:text-white transition-colors">
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-amber-200/70">
              <li><a href="#products" className="hover:text-[#E85D19] transition-colors">Spice Powders</a></li>
              <li><a href="#products" className="hover:text-[#E85D19] transition-colors">Spice Blends</a></li>
              <li><a href="#products" className="hover:text-[#E85D19] transition-colors">Cold-Pressed Oils</a></li>
              <li><a href="#products" className="hover:text-[#E85D19] transition-colors">Whole Spices</a></li>
              <li><a href="#products" className="hover:text-[#E85D19] transition-colors">Organics & Herbs</a></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-amber-200/70">
              <li><a href="#about" className="hover:text-[#E85D19] transition-colors">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-[#E85D19] transition-colors">Customer Reviews</a></li>
              <li><a href="#blog" className="hover:text-[#E85D19] transition-colors">Our Blog</a></li>
              <li><Link to="/shop/cart" className="hover:text-[#E85D19] transition-colors">Shopping Cart</Link></li>
              <li><Link to="/" className="hover:text-[#E85D19] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-amber-200/70">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-[#E85D19] shrink-0" />
                <span>Spice Garden Way, Organic Valley</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-[#E85D19] shrink-0" />
                <span>+1 (800) 555-SPICE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-[#E85D19] shrink-0" />
                <span>hello@spicest.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/50 gap-4">
          <p>© {new Date().getFullYear()} SPICEST. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-amber-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-200 transition-colors">Shipping Info</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
