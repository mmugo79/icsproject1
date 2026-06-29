import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquareDot, Map as MapIcon, LayoutDashboard, User, ShieldCheck, Menu, X, PlusCircle, LogOut, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    if (!user) {
      return [
        { name: 'Home', href: '/', icon: HomeIcon }
      ];
    }
    if (user.role === 'ADMIN') {
      return [
        { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck }
      ];
    }
    return [
      { name: 'Feed', href: '/feed', icon: MessageSquareDot },
      { name: 'Live Map', href: '/map', icon: MapIcon },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Profile', href: '/dashboard?tab=profile', icon: User, tab: 'profile' }
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#dfeae0] bg-white/90 backdrop-blur-md select-none">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-8">
          
          {/* Logo with Forest Green coloring */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#004d2c] rounded-xl flex items-center justify-center shadow-md shadow-[#004d2c]/10">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-xl font-black tracking-tight text-[#004d2c] font-display">RaiaVoice</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                state={item.tab ? { tab: item.tab } : undefined}
                className={cn(
                  "flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-colors hover:text-[#004d2c]",
                  location.pathname === item.href || (item.tab && location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === item.tab) ? "text-[#004d2c]" : "text-[#3e5243]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action controls */}
        <div className="hidden md:flex items-center gap-4">
          {(user && user.role !== 'ADMIN') && (
            <Link to="/report">
              <Button size="sm" className="gap-2 bg-[#004d2c] hover:bg-[#003820] text-xs font-black tracking-widest uppercase text-white rounded-xl h-11 border-none px-5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Report Issue
              </Button>
            </Link>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to={user.role === 'ADMIN' ? '/admin' : '/dashboard?tab=profile'} 
                state={{ tab: 'profile' }}
                className="flex items-center gap-3 transition-opacity hover:opacity-90 cursor-pointer"
              >
                {/* Profile details */}
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-[9px] font-black uppercase text-[#055a36] tracking-widest mt-1">{user.role}</p>
                </div>
                
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-[#dfeae0] shadow-sm select-none hover:border-[#004d2c]/30 transition-all cursor-pointer flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#004d2c]/15 text-[#004d2c] font-black text-xs flex items-center justify-center">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                    </div>
                  )}
                </div>
              </Link>

              <button 
                onClick={handleLogout} 
                className="p-2.5 hover:bg-slate-50 hover:text-red-600 rounded-xl transition-all cursor-pointer text-slate-400"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="h-11 px-5 border-slate-200 text-slate-600 font-extrabold uppercase text-xs rounded-xl">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-11 px-5 bg-[#004d2c] hover:bg-[#003820] text-xs font-extrabold uppercase text-white rounded-xl border-none">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-slate-600 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white shadow-xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-4 text-left">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                state={item.tab ? { tab: item.tab } : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-sm font-extrabold",
                  location.pathname === item.href || (item.tab && location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === item.tab) ? "bg-[#004d2c]/5 text-[#004d2c]" : "text-slate-600"
                )}
              >
                <item.icon className="w-5 h-5 text-[#004d2c]" />
                {item.name}
              </Link>
            ))}

            <hr className="border-slate-100 my-1" />

            {user ? (
              <div className="flex flex-col gap-4">
                <Link 
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard?tab=profile'} 
                  state={{ tab: 'profile' }}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 hover:bg-slate-50 p-2 rounded-xl transition-all w-full text-left cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-xl overflow-hidden border border-[#dfeae0] flex items-center justify-center shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[#004d2c]/15 text-[#004d2c] font-black text-xs flex items-center justify-center">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] font-black uppercase text-[#004d2c] mt-1">{user.role}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                  className="w-full text-left p-3 text-red-600 text-sm font-extrabold flex items-center gap-3 rounded-xl hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-600 font-extrabold uppercase text-xs">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-11 bg-[#004d2c] text-white font-extrabold uppercase text-xs border-none">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {(user && user.role !== 'ADMIN') && (
              <Link to="/report" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 gap-2 bg-[#004d2c] hover:bg-[#003820] text-xs font-black uppercase tracking-widest text-white rounded-xl border-none shadow-md mt-2">
                  <PlusCircle className="w-5 h-5" />
                  Report New Issue
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
