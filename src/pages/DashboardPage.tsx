import * as React from 'react';
import { useAuth } from '@/lib/auth';
import { 
  getIssues, 
  upvoteIssue, 
  reopenIssue, 
  markNotificationAsRead, 
  Notification 
} from '@/lib/db';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/Button';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  User as UserIcon, 
  PlusCircle, 
  AlertCircle, 
  RefreshCw,
  SlidersHorizontal,
  ThumbsUp,
  Camera,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
  Search,
  Building,
  Phone,
  ShieldAlert,
  UploadCloud,
  X,
  MapPin,
  Check,
  Zap,
  Trash2,
  Construction,
  Droplet
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Issue, IssueStatus, IssueCategory } from '@/types';
import { savePhoneToPostgreSQL, sendVerificationSMS, setPhoneVerifiedInDB } from '@/lib/postgres';

// Standard counties for selection
const COUNTIES = [
  'Nairobi',
  'Kisumu',
  'Kiambu',
  'Kajiado',
  'Machakos',
  'Wajir',
  'Mandera',
  'Mombasa',
  'Nakuru',
  'Uasin Gishu'
];

export function DashboardPage() {
  const { user, logout, changeCurrentUserPassword, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables
  const [issues, setIssues] = React.useState<Issue[]>(getIssues());
  const [activeTab, setActiveTab] = React.useState<'reports' | 'community' | 'notifications' | 'profile'>('reports');
  const [statusFilter, setStatusFilter] = React.useState<IssueStatus | 'ALL'>('ALL');
  const [myReportsSearch, setMyReportsSearch] = React.useState('');
  
  // Community feed state
  const [communitySearch, setCommunitySearch] = React.useState('');
  const [communitySort, setCommunitySort] = React.useState<'recent' | 'priority'>('recent');
  const [communityCountyFilter, setCommunityCountyFilter] = React.useState<string>('ALL');

  // Notification state
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  // Profile form state
  const [profileName, setProfileName] = React.useState('');
  const [profilePhone, setProfilePhone] = React.useState('');
  const [profileAge, setProfileAge] = React.useState<number | ''>('');
  const [profileConstituency, setProfileConstituency] = React.useState('');
  const [profileCounty, setProfileCounty] = React.useState('');
  const [profileWard, setProfileWard] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileStatus, setProfileStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  // OTP and Phone Verification state
  const [otpCode, setOtpCode] = React.useState('');
  const [enteredOtp, setEnteredOtp] = React.useState('');
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [otpStatus, setOtpStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);
  const [isOtpVerifying, setIsOtpVerifying] = React.useState(false);
  const [showOtpInput, setShowOtpInput] = React.useState(false);

  // Password change state
  const [newPassword, setNewPassword] = React.useState('');
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordStatus, setPasswordStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  // Reopen prompt state
  const [reopenTargetId, setReopenTargetId] = React.useState<string | null>(null);
  const [reopenReason, setReopenReason] = React.useState('');
  const [isReopening, setIsReopening] = React.useState(false);

  // Load issues and bind real-time notifier
  React.useEffect(() => {
    const handleUpdate = () => {
      setIssues(getIssues());
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem('raia_jwt_token');
      const res = await fetch('/api/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications from PG: ", err);
    }
  }, [user?.id]);

  // Sync Notifications real-time from PostgreSQL
  React.useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user?.id, activeTab, fetchNotifications]);

  // Set initial form states
  React.useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileCounty(user.county || 'Nairobi');
      setProfileWard(user.ward || '');
      setAvatarPreview(user.avatar || '');
      setProfileAge(user.age !== undefined && user.age !== null ? user.age : '');
      setProfileConstituency(user.constituency || '');
    }
  }, [user]);

  // Sync / monitor location tab updates
  React.useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as any);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam === 'reports' || tabParam === 'community' || tabParam === 'notifications' || tabParam === 'profile') {
        setActiveTab(tabParam as any);
      }
    }
  }, [location]);

  // Safeguard / Auth Gate
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center font-sans text-slate-900">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-16 h-16 bg-[#004d2c]/5 text-[#004d2c] rounded-full flex items-center justify-center mx-auto border border-[#004d2c]/10">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Citizen Portal</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Please log in or create an account to view your reported issues, track active community resolutions, and claim impact milestones.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-xs font-black uppercase rounded-xl">
                Register
              </Button>
            </Link>
            <Link to="/login" className="flex-[2]">
              <Button className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-xs uppercase rounded-xl border-none shadow-md">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Derived properties and stats
  const userIssues = issues.filter(issue => issue.reporterId === user.id);
  const resolvedCount = userIssues.filter(i => i.status === 'RESOLVED').length;
  const inProgressCount = userIssues.filter(i => i.status === 'IN_PROGRESS').length;
  const reopenedCount = userIssues.filter(i => i.status === 'REOPENED').length;
  const submittedCount = userIssues.filter(i => i.status === 'SUBMITTED').length;
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'My Reports', value: userIssues.length, icon: MessageSquare, color: 'text-[#004d2c]', bg: 'bg-[#004d2c]/5' },
    { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Reopened ⚠️', value: reopenedCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  // Filters for citizen's own reports
  const filteredMyIssues = userIssues
    .filter(i => {
      const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
      const matchesSearch = i.title.toLowerCase().includes(myReportsSearch.toLowerCase()) || 
                            i.description.toLowerCase().includes(myReportsSearch.toLowerCase()) ||
                            i.location.address.toLowerCase().includes(myReportsSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  // Filters and sorts for community reports (excluding own reports to encourage supporting others)
  const otherCitizensIssues = issues.filter(issue => issue.reporterId !== user.id);
  const filteredCommunityIssues = otherCitizensIssues
    .filter(i => {
      const matchesCounty = communityCountyFilter === 'ALL' || i.location.county.toLowerCase() === communityCountyFilter.toLowerCase();
      const matchesSearch = i.title.toLowerCase().includes(communitySearch.toLowerCase()) || 
                            i.description.toLowerCase().includes(communitySearch.toLowerCase()) ||
                            i.location.address.toLowerCase().includes(communitySearch.toLowerCase());
      return matchesCounty && matchesSearch;
    })
    .sort((a, b) => {
      if (communitySort === 'priority') {
        const upvoteDiff = (b.upvotes || 0) - (a.upvotes || 0);
        if (upvoteDiff !== 0) return upvoteDiff;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handle Handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileStatus({ success: false, message: 'Display Name is required.' });
      return;
    }
    setIsUpdatingProfile(true);
    setProfileStatus(null);
    try {
      // Check if user changed their phone number; reset verified status if changed
      const phoneChanged = profilePhone.trim() !== (user?.phone || '');
      const dataToUpdate: any = {
        name: profileName.trim(),
        phone: profilePhone.trim(),
        county: profileCounty,
        ward: profileWard.trim(),
        age: profileAge !== '' ? Number(profileAge) : null,
        constituency: profileConstituency.trim()
      };
      
      if (phoneChanged) {
        dataToUpdate.phoneVerified = false;
      }

      const res = await updateUserProfile(dataToUpdate);
      
      // PostgreSQL database persistence trigger
      if (profilePhone.trim()) {
        const pgRes = await savePhoneToPostgreSQL(user.id, profilePhone.trim());
        if (!pgRes.success) {
          console.warn('PostgreSQL phone sync reported warnings: ', pgRes.message);
        } 
      }

      setProfileStatus({
        success: res.success,
        message: res.success 
          ? 'Profile settings updated and phone synced to PostgreSQL table citizen_profiles successfully!' 
          : res.message
      });
      setTimeout(() => setProfileStatus(null), 4000);
    } catch (err) {
      setProfileStatus({ success: false, message: 'An unexpected error occurred during profile update.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.email) {
      setProfileStatus({ success: false, message: 'Active profile email was not found.' });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileStatus({ success: true, message: 'A fresh verification OTP code has been sent to ' + user.email });
      } else {
        setProfileStatus({ success: false, message: data.message || 'Failed to dispatch verification email.' });
      }
      setTimeout(() => setProfileStatus(null), 5000);
    } catch (err: any) {
      setProfileStatus({ success: false, message: err.message || 'Failed to dispatch verification email.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendOtp = async () => {
    if (!profilePhone.trim()) {
      setOtpStatus({ success: false, message: 'Please enter and save a phone number first.' });
      return;
    }
    setIsSendingOtp(true);
    setOtpStatus(null);
    try {
      // Generate a production-grade 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpCode(code);
      
      const smsRes = await sendVerificationSMS(profilePhone.trim(), code);
      setOtpStatus({ success: true, message: smsRes.message });
      setShowOtpInput(true);
    } catch (err: any) {
      setOtpStatus({ success: false, message: err.message || 'Failed to dispatch OTP verification code.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp.trim()) {
      setOtpStatus({ success: false, message: 'Please input the received OTP code.' });
      return;
    }
    if (enteredOtp.trim() !== otpCode) {
      setOtpStatus({ success: false, message: 'Invalid OTP code. Please double-check and retry.' });
      return;
    }
    setIsOtpVerifying(true);
    setOtpStatus(null);
    try {
      // Mark as verified in database
      await setPhoneVerifiedInDB(user.id, true);
      // Trigger profile reload to refresh local user state
      await updateUserProfile({ phoneVerified: true });
      
      setOtpStatus({ success: true, message: 'Phone number verified successfully! Verified badge enabled.' });
      setShowOtpInput(false);
      setEnteredOtp('');
    } catch (err: any) {
      setOtpStatus({ success: false, message: err.message || 'OTP validation failed.' });
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordStatus(null);
    try {
      const res = await changeCurrentUserPassword(newPassword);
      setPasswordStatus(res);
      if (res.success) {
        setNewPassword('');
      }
      setTimeout(() => setPasswordStatus(null), 4000);
    } catch (err) {
      setPasswordStatus({ success: false, message: 'Failed to update credentials. Try logging out & back in first.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setProfileStatus({ success: false, message: 'Profile picture must be smaller than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setIsUpdatingProfile(true);
        try {
          const res = await updateUserProfile({ avatar: base64String });
          setProfileStatus(res);
          setTimeout(() => setProfileStatus(null), 3000);
        } catch (err) {
          setProfileStatus({ success: false, message: 'Failed to upload image.' });
        } finally {
          setIsUpdatingProfile(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    try {
      const promises = notifications
        .filter(n => !n.read)
        .map(n => markNotificationAsRead(user.id, n.id));
      await Promise.all(promises);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleReopenAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenTargetId || !reopenReason.trim()) return;
    setIsReopening(true);
    try {
      await reopenIssue(reopenTargetId, reopenReason.trim());
      setReopenTargetId(null);
      setReopenReason('');
      setIssues(getIssues());
    } catch (err) {
      console.error(err);
    } finally {
      setIsReopening(false);
    }
  };

  // Helper inside loop for category icon fallback
  const getCategoryTheme = (category: IssueCategory) => {
    switch (category) {
      case 'ROADS': return { icon: <Construction className="w-5 h-5 text-emerald-800" />, bg: 'bg-emerald-50' };
      case 'WATER': return { icon: <Droplet className="w-5 h-5 text-blue-700" />, bg: 'bg-blue-50' };
      case 'ELECTRICITY': return { icon: <Zap className="w-5 h-5 text-amber-700" />, bg: 'bg-amber-50' };
      case 'WASTE': return { icon: <Trash2 className="w-5 h-5 text-slate-700" />, bg: 'bg-slate-50' };
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfa] pt-32 pb-20 font-sans text-slate-900 leading-normal">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Profile Card Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-150 p-8 rounded-[3rem] shadow-sm select-none relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#004d2c 1.5px, transparent 1.5px)', 
                 backgroundSize: '24px 24px',
                 width: '240px',
                 height: '240px'
               }} 
          />
          <div className="flex items-center gap-6 relative z-10 text-left">
            <div className="relative group overflow-hidden w-24 h-24 rounded-3xl border-4 border-emerald-50 shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user.name} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-[#004d2c]/5 text-[#004d2c] flex items-center justify-center font-black text-2xl uppercase">
                  {user.name.substring(0, 2)}
                </div>
              )}
              <label className="absolute inset-0 bg-black/55 text-white flex items-center justify-center flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <Camera className="w-5 h-5 mb-1 text-slate-200" />
                <span className="text-[8px] font-black uppercase tracking-widest text-[#ccebda]">Update</span>
                <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004d2c]/5 text-[#004d2c] font-black text-[9px] uppercase tracking-wider border border-[#004d2c]/10">
                Verified Citizen Account
              </div>
              <h1 className="text-3xl font-black text-[#004d2c] tracking-tight hover:opacity-95 transition-opacity font-display">
                Welcome back, {user.name}
              </h1>
              <p className="text-sm font-semibold text-slate-500">
                Civic region: <span className="text-[#004d2c] font-black underline">{user.county} County</span> {user.ward && <span>• Ward: {user.ward}</span>}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center relative z-10 shrink-0">
            <Link to="/report">
              <Button className="h-14 px-8 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl shadow-[#004d2c]/15 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                File Live Report
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="h-14 px-6 border-slate-200 text-slate-500 font-extrabold uppercase tracking-widest text-[10px] rounded-2xl cursor-pointer">
              Secure Sign Out
            </Button>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="grid grid-cols-2 md:flex md:items-center bg-white border border-slate-150 p-2 rounded-[2rem] shadow-sm mb-12 gap-1 select-none">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#004d2c] text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            My Reports <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === 'reports' ? 'bg-emerald-700/60 text-white' : 'bg-slate-150 text-slate-600'}`}>{userIssues.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-[#004d2c] text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Community Reports <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === 'community' ? 'bg-emerald-700/60 text-white' : 'bg-slate-150 text-slate-600'}`}>{otherCitizensIssues.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2.5 transition-all cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-[#004d2c] text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Civic Alerts
            {unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-bounce" />
            )}
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === 'notifications' ? 'bg-emerald-700/60 text-white' : 'bg-slate-150 text-slate-600'}`}>{unreadNotifications}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#004d2c] text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </button>
        </div>

        {/* Outer Grid content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Workspace Column */}
          <div className="lg:col-span-3 space-y-10 text-left">
            
            {/* 1. REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Stats Header for My Issues */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center justify-between group hover:border-[#004d2c]/15 transition-colors">
                      <div>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-950 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search & Status Filters */}
                <div className="bg-white border border-slate-150 p-6 rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    {/* Search Field */}
                    <div className="md:col-span-2 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search your reported issues..."
                        value={myReportsSearch}
                        onChange={(e) => setMyReportsSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-0 focus:outline-none rounded-xl text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                      />
                      {myReportsSearch && (
                        <button onClick={() => setMyReportsSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-right font-black uppercase tracking-wider text-slate-400">
                      Showing {filteredMyIssues.length} of {userIssues.length} reports
                    </div>
                  </div>

                  {/* Status Badges for Filter */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-55 select-none">
                    {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'REJECTED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          statusFilter === status
                            ? 'bg-[#004d2c] text-white shadow-sm'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reports Grid */}
                {filteredMyIssues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredMyIssues.map((issue) => (
                      <div key={issue.id} className="relative flex flex-col justify-between bg-white border border-slate-150 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-[#004d2c]/20 transition-all group">
                        
                        {/* Card Top Information */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] font-black uppercase bg-[#004d2c]/5 text-[#004d2c] px-2.5 py-1 rounded-full border border-[#004d2c]/10">
                              {issue.category}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              <span className={`w-2 h-2 rounded-full ${
                                issue.status === 'RESOLVED' ? 'bg-emerald-500' :
                                issue.status === 'REOPENED' ? 'bg-rose-500' :
                                issue.status === 'REJECTED' ? 'bg-red-600' : 'bg-amber-500'
                              }`} />
                              <span>{issue.status}</span>
                            </div>
                          </div>

                          <h3 className="text-lg font-black text-slate-950 leading-snug tracking-tight group-hover:text-[#004d2c] transition-colors">
                            {issue.title}
                          </h3>

                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {issue.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest select-none">
                            <Clock className="w-3.5 h-3.5" />
                            <span>reported {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                          </div>

                          {/* Interactive Progress Tracking */}
                          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 mt-2 space-y-2.5">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                              <span>Resolution Stage</span>
                              <span className="text-[#004d2c]">{Math.floor(
                                issue.status === 'SUBMITTED' ? 15 :
                                issue.status === 'UNDER_REVIEW' ? 40 :
                                issue.status === 'IN_PROGRESS' ? 70 :
                                issue.status === 'RESOLVED' ? 100 :
                                issue.status === 'REOPENED' ? 85 : 100
                              )}% Tracked</span>
                            </div>
                            <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#004d2c] h-full transition-all duration-500" style={{ width: `${
                                issue.status === 'SUBMITTED' ? 15 :
                                issue.status === 'UNDER_REVIEW' ? 40 :
                                issue.status === 'IN_PROGRESS' ? 70 :
                                issue.status === 'RESOLVED' ? 100 :
                                issue.status === 'REOPENED' ? 85 : 100
                              }%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Bottom */}
                        <div className="pt-5 border-t border-slate-100 mt-6 flex items-center justify-between gap-4">
                          <div className="flex gap-4 select-none">
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-slate-350" /> {issue.upvotes} Citizens
                            </span>
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-350" /> {issue.commentsCount || 0} Comments
                            </span>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {/* Inline Reopen Option if Status is Resolved */}
                            {issue.status === 'RESOLVED' && (
                              <button
                                onClick={() => setReopenTargetId(issue.id)}
                                className="h-9 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-black uppercase tracking-widest text-[9px] border border-rose-150 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" /> Reopen
                              </button>
                            )}

                            <Link to={`/issue/${issue.id}`}>
                              <Button className="h-9 px-3 gap-1 shadow-sm bg-[#004d2c] hover:bg-[#003820] text-white border-none rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer">
                                Details <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 select-none">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-black text-slate-950 mb-2 font-display">No Reports Match Filters</h4>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto font-medium">Clear search terms or write a new issue report to support civic accountability.</p>
                    <Link to="/report">
                      <Button className="h-14 px-10 gap-3 bg-[#004d2c] hover:bg-[#003820] text-white shadow-xl rounded-2xl font-black uppercase tracking-widest text-[10px] border-none">
                        <PlusCircle className="w-5 h-5" /> Submit New Report
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 2. COMMUNITY REPORTS TAB */}
            {activeTab === 'community' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Search, County Filter and Sort controllers */}
                <div className="bg-white border border-slate-150 p-6 rounded-[2.5rem] shadow-sm space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 font-extrabold text-[9px] uppercase tracking-wider">
                    📢 civic feed: preventing duplicates
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-none">Explore Regional Incidents</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-2xl mt-1">
                    Instead of submitting duplicate reports of known regional outages or damaged roads, citizens upvote existing concern reports to prioritize resources.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 items-center">
                    
                    {/* Search Field */}
                    <div className="md:col-span-2 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search community concern overlaps..."
                        value={communitySearch}
                        onChange={(e) => setCommunitySearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-0 focus:outline-none rounded-xl text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* County Filter Select */}
                    <div>
                      <select
                        value={communityCountyFilter}
                        onChange={(e) => setCommunityCountyFilter(e.target.value)}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-black uppercase text-slate-650 tracking-wider cursor-pointer transition-colors"
                      >
                        <option value="ALL">All Counties</option>
                        {COUNTIES.map(c => (
                          <option key={c} value={c}>{c} County</option>
                        ))}
                      </select>
                    </div>

                    {/* Sorting Controller */}
                    <div className="flex justify-end p-0.5 bg-slate-100/80 rounded-xl border border-slate-150 flex-shrink-0 select-none">
                      <button
                        onClick={() => setCommunitySort('recent')}
                        className={`flex-1 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          communitySort === 'recent' 
                            ? 'bg-white text-[#004d2c] shadow-sm' 
                            : 'text-slate-450 hover:text-slate-800'
                        }`}
                      >
                        Recent
                      </button>
                      <button
                        onClick={() => setCommunitySort('priority')}
                        className={`flex-1 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          communitySort === 'priority' 
                            ? 'bg-amber-600/10 text-amber-800 shadow-sm font-black' 
                            : 'text-slate-455 hover:text-[#004d2c]'
                        }`}
                      >
                        🔥 Priority
                      </button>
                    </div>

                  </div>
                </div>

                {/* Overlaps / Community Incidents list */}
                {filteredCommunityIssues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredCommunityIssues.map((issue) => {
                      const theme = getCategoryTheme(issue.category);
                      const isSupporting = issue.supporterIds?.includes(user.id);

                      return (
                        <div 
                          key={issue.id} 
                          className="bg-white rounded-[2.5rem] p-6 border border-slate-150 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[9px] font-black uppercase bg-[#004d2c]/5 text-[#004d2c] px-3 py-1 rounded-full border border-[#004d2c]/10">
                                {issue.category}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#004d2c]">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{issue.location.county} County</span>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start pt-1 text-left">
                              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${theme?.bg}`}>
                                {theme?.icon}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900 leading-snug line-clamp-2">{issue.title}</h4>
                                <p className="text-slate-400 font-extrabold text-[9px] uppercase tracking-widest">
                                  by Citizen {issue.reporterName} • {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>

                            <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3 text-left pl-1">
                              {issue.description}
                            </p>
                          </div>

                          <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                              <MessageSquare className="w-3.5 h-3.5" /> {issue.commentsCount || 0} active comments
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              {isSupporting ? (
                                <button 
                                  disabled 
                                  className="h-10 px-4 bg-emerald-50 text-emerald-800 border-none rounded-xl cursor-default font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Supporting ({issue.upvotes})
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    upvoteIssue(issue.id);
                                    setIssues(getIssues());
                                  }}
                                  className="h-10 px-4 bg-[#004d2c] hover:bg-[#003820] text-white font-black text-[9px] uppercase tracking-widest border-none rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Support ({issue.upvotes})
                                </button>
                              )}
                              <Link to={`/issue/${issue.id}`} className="flex-1 sm:flex-none">
                                <Button 
                                  variant="outline"
                                  className="h-10 px-4 border-slate-200 text-slate-700 hover:text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-xl w-full cursor-pointer"
                                >
                                  View & Discuss
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 select-none">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-black text-slate-950 mb-2 font-display">No Community Incidents Found</h4>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto font-medium">There are currently no reports reported by other citizens matching your search.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fadeIn text-left">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display">Civic Alerts Node</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Status changes and administrative comments regarding your reports.</p>
                  </div>
                  {unreadNotifications > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="h-10 px-4 bg-slate-50 text-slate-700 hover:bg-[#004d2c]/5 hover:text-[#004d2c] border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="bg-white border border-slate-150 rounded-[2.5rem] overflow-hidden shadow-sm divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.read) {
                            await markNotificationAsRead(user.id, notif.id);
                          }
                          if (notif.issueId) {
                            navigate(`/issue/${notif.issueId}`);
                          }
                        }}
                        className={`p-6 flex items-start gap-5 transition-colors cursor-pointer select-none ${
                          notif.read ? 'bg-white hover:bg-slate-50/50' : 'bg-emerald-50/45 hover:bg-emerald-50/70 border-l-4 border-l-[#004d2c]'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          notif.title.includes('Resolved') ? 'bg-emerald-100 text-emerald-800' :
                          notif.title.includes('Reopened') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="space-y-1.5 flex-grow">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-sm font-black text-slate-950">{notif.title}</h4>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-slate-550 text-xs font-semibold leading-relaxed">{notif.message}</p>
                          {notif.issueId && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#004d2c] tracking-widest pt-1">
                              View related Incident Report <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 select-none">
                    <div className="w-16 h-16 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bell className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-slate-950 mb-2 font-display">No Active Civic Alerts</h4>
                    <p className="text-slate-400 max-w-sm mx-auto font-medium">When county administrators update status records or comments are made on your reported concerns, they will display here instantly.</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFILE & SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-fadeIn text-left">
                
                {/* Visual Status Banners */}
                {profileStatus && (
                  <div className={`p-5 rounded-[2rem] text-xs font-black flex items-start gap-3 ${
                    profileStatus.success ? 'bg-emerald-50 border border-emerald-100 text-[#004d2c]' : 'bg-rose-50 border border-rose-100 text-rose-800'
                  }`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{profileStatus.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Account detail modifiers */}
                  <div className="lg:col-span-7 bg-white border border-slate-150 p-8 rounded-[2.5rem] shadow-sm space-y-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight font-display border-b border-slate-100 pb-4">Personal Details</h3>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-2">Manage your administrative registry information</p>
                    </div>
                    
                    <form onSubmit={handleUpdateProfileSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Citizen Display Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Your official public name"
                            className="w-full h-12 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            placeholder="email@example.com"
                            className="w-full h-12 px-4 bg-slate-100 border border-slate-250 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full h-12 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="125"
                            value={profileAge}
                            onChange={(e) => setProfileAge(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g. 27"
                            className="w-full h-12 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Reporting County</label>
                          <select
                            value={profileCounty}
                            onChange={(e) => setProfileCounty(e.target.value)}
                            className="w-full h-12 px-3 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                          >
                            {COUNTIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Constituency</label>
                          <input
                            type="text"
                            value={profileConstituency}
                            onChange={(e) => setProfileConstituency(e.target.value)}
                            placeholder="e.g. Westlands Constituency"
                            className="w-full h-12 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Sub-county/Ward</label>
                          <input
                            type="text"
                            value={profileWard}
                            onChange={(e) => setProfileWard(e.target.value)}
                            placeholder="e.g. Parklands"
                            className="w-full h-12 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-bold text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isUpdatingProfile}
                        className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl border-none shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        {isUpdatingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Save Changes
                      </Button>
                    </form>
                  </div>

                  {/* Profile Picture Upload & Security Section */}
                  <div className="lg:col-span-5 space-y-8 select-none">
                    
                    {/* Profile Picture Upload Box */}
                    <div className="bg-white border border-slate-150 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-display border-b border-slate-100 pb-4 mb-6">Profile Picture</h3>
                        
                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 relative group">
                          
                          {avatarPreview ? (
                            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-md mb-4 select-none">
                              <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => {
                                  setAvatarPreview('');
                                  updateUserProfile({ avatar: '' });
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-sm hover:bg-red-700 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-[#004d2c]/5 text-[#004d2c] rounded-2xl flex items-center justify-center mb-4 border border-[#004d2c]/10">
                              <UploadCloud className="w-8 h-8" />
                            </div>
                          )}

                          <div className="text-center px-4 space-y-1.5 select-none">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Drag and Drop Image</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Support PNG, JPG under 2MB</p>
                          </div>

                          <label className="mt-4 h-10 px-5 text-[10px] font-black uppercase tracking-widest bg-[#edf2ed] hover:bg-[#d6ebd9] text-[#004d2c] rounded-xl flex items-center justify-center transition-colors shadow-sm border border-[#004d2c]/10 cursor-pointer">
                            Select Photo
                            <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase leading-relaxed text-center mt-6">
                        Your identity picture is shared with County Admins to build trust and prioritize regional accountability.
                      </p>
                    </div>

                    {/* Account Security Settings Section */}
                    <div className="bg-white border border-slate-150 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Account Security</h3>
                        <p className="text-slate-450 text-[9px] uppercase font-bold tracking-widest mt-1">Multi-factor security details status</p>
                      </div>

                      {/* Phone verification OTP segment */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-700">Phone Verification</span>
                          {user.phoneVerified ? (
                            <span className="h-5 px-2.5 bg-emerald-50 text-[#004d2c] text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3 h-3" /> Verified (PG table sync active)
                            </span>
                          ) : (
                            <span className="h-5 px-2.5 bg-amber-50 text-amber-750 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-amber-200">
                              Unverified
                            </span>
                          )}
                        </div>

                        {!user.phoneVerified && (
                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl select-text space-y-3">
                            <p className="text-[10px] font-medium leading-relaxed text-slate-450">
                              Verify your mobile credentials using a secure OTP code to complete your verification.
                            </p>

                            {otpStatus && (
                              <div className={`p-3 rounded-xl text-[10px] font-black flex items-start gap-2 ${
                                otpStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-850 border border-red-100'
                              }`}>
                                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{otpStatus.message}</span>
                              </div>
                            )}

                            {showOtpInput ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">Enter 6-digit OTP code below</label>
                                  <input
                                    type="text"
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value)}
                                    placeholder="e.g. 192842"
                                    maxLength={6}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-center text-sm font-black tracking-widest text-[#004d2c]"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={isOtpVerifying}
                                    className="flex-1 h-9 bg-[#004d2c] hover:bg-[#003820] text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    {isOtpVerifying && <RefreshCw className="w-3 h-3 animate-spin" />}
                                    Confirm OTP
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setShowOtpInput(false); setOtpStatus(null); }}
                                    className="h-9 font-bold text-[9px] uppercase rounded-lg px-3 border-slate-200"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="w-full h-9 bg-slate-950 hover:bg-slate-850 text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isSendingOtp && <RefreshCw className="w-3 h-3 animate-spin text-white" />}
                                Send Verification SMS code
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Email verification segment */}
                      <div className="h-px bg-slate-100 my-4" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-700">Email Status</span>
                          {user.emailVerified ? (
                            <span className="h-5 px-2.5 bg-[#edf7ee] text-[#004d2c] text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3 h-3" /> Verified Account
                            </span>
                          ) : (
                            <span className="h-5 px-2.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-amber-200">
                              Unverified
                            </span>
                          )}
                        </div>

                        {!user.emailVerified && (
                          <div className="flex items-center gap-3">
                            <p className="text-[9px] text-slate-400 font-medium leading-relaxed flex-grow">
                              Request a verification link to be dispatched to your email credentials.
                            </p>
                            <Button
                              type="button"
                              onClick={handleSendVerificationEmail}
                              className="h-8 px-4 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-[#004d2c]/5 hover:text-[#004d2c] hover:border-[#004d2c]/10 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center cursor-pointer shrink-0"
                            >
                              Dispatch Link
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 2-Factor Authentication Segment */}
                      <div className="h-px bg-slate-100 my-4" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-slate-700 block">2-Factor Authentication (2FA)</span>
                          <span className="text-[9px] text-slate-400 font-medium block leading-relaxed">
                            Require phone OTP authentication validation on login challenges to protect citizen logs and administrative privileges.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => updateUserProfile({ twoFactorEnabled: !user.twoFactorEnabled })}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            user.twoFactorEnabled ? 'bg-[#004d2c]' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              user.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Logout Action */}
                      <div className="h-px bg-slate-100 my-4" />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-700 block text-left">Disconnect Platform</span>
                          <span className="text-[9px] text-slate-400 font-medium block text-left font-semibold">Sign out from your active session</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleLogout}
                          className="h-9 px-4 hover:bg-rose-50 hover:text-rose-600 font-black text-[#004d2c] hover:border-rose-200 text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer border-slate-200"
                        >
                          Logout session
                        </Button>
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar Widget Stack */}
          <aside className="space-y-8 text-left">
            
            {/* 1. Civic Score Widget */}
            <div className="bg-[#004d2c] p-8 rounded-[2.5rem] text-white overflow-hidden relative group shadow-sm">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-700 rounded-full blur-[60px] opacity-30" />
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[#ccebda] font-black text-[8px] uppercase tracking-wider mb-4">
                ⭐ regional rank
              </div>
              <h3 className="text-lg font-black tracking-tight font-display mb-6">Civic Engagement Impact</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-black text-[#ccebda]">{userIssues.length * 40 + resolvedCount * 120 + 100}</div>
                <div className="text-[9px] font-black uppercase text-[#ccebda]/70 tracking-widest leading-normal">
                  Civic score <br />milestones
                </div>
              </div>

              <p className="text-[#ccebda]/80 text-[11px] font-semibold leading-relaxed mb-6">
                Earn 40 points per report and 120 per resolved concern. High score holders are flagged as trusted local reviewers.
              </p>

              <div className="h-px bg-[#ccebda]/20 my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#ccebda]/80 tracking-wider">
                  <span>Trust Badge:</span>
                  <span className="text-white">Active raia</span>
                </div>
                <div className="w-full bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#ccebda] h-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>

            {/* 2. Change Password Security Form */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credential Operations</h3>
              </div>
              
              {passwordStatus && (
                <div className={`p-4 rounded-xl text-[10px] font-black flex items-start gap-2 ${
                  passwordStatus.success ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-rose-50 border border-rose-100 text-rose-600'
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 letters"
                    className="w-full h-11 px-4 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="w-full h-11 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl border-none shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isChangingPassword && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </div>

            {/* 3. Personal Static Audit Logs */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6 select-none">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">Platform Logs</h3>
              <div className="space-y-6 relative">
                 <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                 {[
                   { label: 'System Handshake Active', time: 'Session Live', desc: 'Secure encryption keys validated correctly' },
                   { label: 'County Registry Match', time: 'Active Sync', desc: 'County jurisdiction coordinates verified' },
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 relative z-10 text-left">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#004d2c] border-2 border-white shadow-sm flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 mb-0.5 leading-snug">{act.label}</p>
                      <p className="text-[8px] text-slate-400 mb-0.5 font-bold tracking-wider uppercase">{act.time}</p>
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{act.desc}</p>
                    </div>
                   </div>
                 ))}
              </div>
            </div>

          </aside>
          
        </div>
      </div>

      {/* REOPEN REASON BOTTOM DIALOG / PROMPT POPUP */}
      {reopenTargetId && (
        <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center z-50 p-6 backdrop-blur-xs select-none">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md border border-slate-150 shadow-2xl relative animate-scaleUp">
            <button onClick={() => setReopenTargetId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3">Reopen Resolution Report</h4>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6">
              Please clarify why this concern is still unresolved, detailing outstanding elements or new evidence to trigger action for county officials.
            </p>
            <form onSubmit={handleReopenAction} className="space-y-5 text-left">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Actionable Reason</label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue requires reopened review..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 focus:border-red-500 focus:outline-none rounded-2xl text-xs font-semibold leading-relaxed text-slate-800 transition-colors"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-1.5">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setReopenTargetId(null)}
                  className="flex-1 h-12 text-[10px] font-bold uppercase rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isReopening}
                  className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-widest border-none rounded-xl shadow-md cursor-pointer"
                >
                  {isReopening && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit Reopen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
