import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant py-12">
      <div className="container mx-auto px-4"> 
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-surface font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">RaiaVoice</span>
            </Link>
            <p className="text-on-surface-variant max-w-sm mb-6">
              A modern civic issue reporting and public participation platform for Kenya.
              Empowering citizens to build better communities together.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-on-surface">Platform</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/feed" className="hover:text-primary transition-colors">Issue Feed</Link></li>
              <li><Link to="/map" className="hover:text-primary transition-colors">Community Map</Link></li>
              <li><Link to="/report" className="hover:text-primary transition-colors">Report an Issue</Link></li>
              <li><Link to="/stats" className="hover:text-primary transition-colors">Transparency Stats</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-on-surface">Support</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-outline-variant mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} RaiaVoice. Built for a better Kenya.
          </p>
          <div className="flex gap-6 text-xs text-on-surface-variant">
            <span>Made with 💚 in Nairobi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

