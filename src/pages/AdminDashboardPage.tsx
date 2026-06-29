import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { 
  getIssues, 
  updateIssueAdminDetails, 
  getComments, 
  saveComment 
} from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Lock,
  ArrowLeft,
  X,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  Check,
  Ban,
  ClipboardList,
  UserCheck,
  Send,
  Map,
  MapPinned
} from 'lucide-react';
import { IssueStatus, Issue, Comment } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

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

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [issues, setIssues] = React.useState<Issue[]>(getIssues());
  const [selectedIssueId, setSelectedIssueId] = React.useState<string | null>(null);
  
  // Filter States
  const [statusFilter, setStatusFilter] = React.useState<IssueStatus | 'ALL'>('ALL');
  const [countyFilter, setCountyFilter] = React.useState<string>('ALL');
  const [constituencyFilter, setConstituencyFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Quick citizen registry stat count
  const [citizenCount, setCitizenCount] = React.useState(0);

  // Administrative Notes states for selected issue
  const [adminNotes, setAdminNotes] = React.useState('');
  const [actionNotes, setActionNotes] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [constituencyVal, setConstituencyVal] = React.useState('');
  const [isSavingDetails, setIsSavingDetails] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  // Discussion states for selected issue
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = React.useState('');
  const [commentError, setCommentError] = React.useState('');

  React.useEffect(() => {
    const handleUpdate = () => {
      setIssues(getIssues());
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    
    // Load registered citizen count
    const savedUsersStr = localStorage.getItem('raia_users') || '[]';
    try {
      const parsed = JSON.parse(savedUsersStr);
      const list = parsed.filter((u: any) => u.role === 'CITIZEN');
      setCitizenCount(list.length);
    } catch (e) {}

    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, []);

  // Sync selected issue details when cache changes
  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

  React.useEffect(() => {
    if (selectedIssue) {
      setAdminNotes(selectedIssue.adminNotes || '');
      setActionNotes(selectedIssue.actionNotes || '');
      setAssignedTo(selectedIssue.assignedTo || '');
      setConstituencyVal(selectedIssue.location.constituency || '');
      setComments(getComments(selectedIssue.id));
    } else {
      setAdminNotes('');
      setActionNotes('');
      setAssignedTo('');
      setConstituencyVal('');
      setComments([]);
    }
  }, [selectedIssueId, selectedIssue]);

  // Access control check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Denied</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            The Administration Dashboard is restricted to authorized public managers. Please login with admin credentials.
          </p>
          <div className="flex gap-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-xs font-black uppercase rounded-xl">
                Home
              </Button>
            </Link>
            <Link to="/login" className="flex-[2]">
              <Button className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-xs uppercase rounded-xl border-none shadow-md">
                Admin Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assignedCategories = user.assignedCategories || [];

  // Filter issues based on assigned categories for this specific admin
  // (Category admins only see their assigned category, Government admin has empty list meaning they see all categories)
  const managedIssues = issues.filter(issue => {
    return assignedCategories.length === 0 || assignedCategories.includes(issue.category);
  });

  // Comprehensive filters: Search, Status, County, and Constituency/Ward
  const filteredIssues = managedIssues.filter(issue => {
    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
    const matchesCounty = countyFilter === 'ALL' || issue.location.county.toLowerCase() === countyFilter.toLowerCase();
    
    // Check constituency match either in issue.location.constituency or substring in issue.location.address
    const constituency = (issue.location.constituency || '').toLowerCase();
    const address = (issue.location.address || '').toLowerCase();
    const matchesConstituency = !constituencyFilter.trim() || 
                               constituency.includes(constituencyFilter.toLowerCase()) ||
                               address.includes(constituencyFilter.toLowerCase());

    const matchesSearch = !searchQuery.trim() ||
                          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCounty && matchesConstituency && matchesSearch;
  });

  // Admin stats counters
  const stats = [
    { 
      label: 'Pending Review', 
      value: managedIssues.filter(i => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length, 
      icon: AlertCircle, 
      color: 'text-red-605', 
      bg: 'bg-red-50' 
    },
    { 
      label: 'Reopened Requests', 
      value: managedIssues.filter(i => i.status === 'REOPENED').length, 
      icon: TrendingUp, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    { 
      label: 'In Progress', 
      value: managedIssues.filter(i => i.status === 'IN_PROGRESS').length, 
      icon: Clock, 
      color: 'text-amber-650', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Total Resolved', 
      value: managedIssues.filter(i => i.status === 'RESOLVED').length, 
      icon: CheckCircle2, 
      color: 'text-emerald-650', 
      bg: 'bg-emerald-50' 
    },
  ];

  // Quick Action: Update Status
  const handleUpdateStatus = (id: string, nextStatus: IssueStatus) => {
    updateIssueAdminDetails(id, { status: nextStatus });
  };

  // Dedicated Save for Administrative Details
  const handleSaveAdminDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId) return;
    setIsSavingDetails(true);
    setSaveStatus(null);
    try {
      await updateIssueAdminDetails(selectedIssueId, {
        adminNotes: adminNotes.trim(),
        actionNotes: actionNotes.trim(),
        assignedTo: assignedTo.trim(),
        constituency: constituencyVal.trim()
      });
      setSaveStatus({ success: true, message: 'Administrative parameters recorded successfully.' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ success: false, message: 'Failed to record details.' });
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Immediate Mark as Resolved action
  const handleMarkAsResolved = async () => {
    if (!selectedIssueId) return;
    setIsSavingDetails(true);
    try {
      await updateIssueAdminDetails(selectedIssueId, {
        status: 'RESOLVED',
        adminNotes: adminNotes ? adminNotes : 'Marked as completed and resolved by executive management.'
      });
      setSaveStatus({ success: true, message: 'Issue marked resolved. Notifications dispatched.' });
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Immediate Mark as Rejected action
  const handleRejectReport = async () => {
    if (!selectedIssueId) return;
    setIsSavingDetails(true);
    try {
      await updateIssueAdminDetails(selectedIssueId, {
        status: 'REJECTED',
        adminNotes: adminNotes ? adminNotes : 'Declined report. Insufficient evidence/duplicate submission.'
      });
      setSaveStatus({ success: true, message: 'Report rejected and closed.' });
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Add Comment on behalf of Admin Team
  const handlePostAdminComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!selectedIssueId || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: 'c-admin-' + Math.random().toString(36).substr(2, 9),
      issueId: selectedIssueId,
      userId: user.id,
      userName: `📢 Admin: ${user.name}`,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    saveComment(newComment);
    setNewCommentText('');
    setComments(getComments(selectedIssueId));
  };

  return (
    <div className="min-h-screen bg-[#fafcfa] pt-32 pb-20 font-sans text-slate-900 leading-normal select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Block without any "Report Issue" action button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2 text-[#004d2c] font-black text-[10px] uppercase tracking-[0.25em]">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              County Back-Office Operations Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#004d2c] tracking-tight font-display">
              {assignedCategories.length > 0 ? 'Jurisdiction Control' : 'Federal Administration'}
            </h1>
            <p className="text-slate-500 font-semibold max-w-2xl">
              Resolution jurisdiction panel for <span className="text-slate-900 font-black">{user.name}</span>. 
              {assignedCategories.length > 0 ? (
                <span className="text-[#004d2c] font-bold"> Managing: {assignedCategories.join(', ')} reports.</span>
              ) : (
                <span className="text-slate-600 font-bold"> Overseeing all county categories.</span>
              )}
              {user.institution && <span className="block text-xs font-black text-[#004d2c] uppercase tracking-wider mt-1.5 bg-[#004d2c]/5 px-3 py-1.5 rounded-xl w-fit">Agency: {user.institution}</span>}
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex-grow md:flex-grow-0 h-16 px-8 border-slate-200 bg-white font-black uppercase text-[10px] rounded-2xl cursor-pointer"
            >
              Sign Out Hub
            </Button>
            <Link to="/feed" className="flex-grow md:flex-grow-0">
              <Button className="w-full h-16 px-8 bg-[#004d2c] hover:bg-[#003820] text-white font-black uppercase text-[10px] rounded-2xl border-none shadow-xl shadow-[#004d2c]/10 cursor-pointer">
                View Live Feed
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-sm flex items-center justify-between group hover:border-[#004d2c]/20 transition-all duration-300">
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Dual Pane Layout: Main Action Table vs Slider Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Action Queue Column (Takes full width if no selection; 2 cols if selected) */}
          <div className={`${selectedIssueId ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8 transition-all duration-500`}>
            
            {/* Filters Dashboard Panel */}
            <div className="bg-white rounded-[2.5rem] border border-slate-150 p-6 shadow-sm space-y-6 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                🔍 Filter Engine controls
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                
                {/* Search Text */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by title, citizen, ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#004d2c]"
                  />
                </div>

                {/* County Selection */}
                <div>
                  <select
                    value={countyFilter}
                    onChange={(e) => setCountyFilter(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 outline-none rounded-xl text-xs font-black uppercase text-slate-600 cursor-pointer"
                  >
                    <option value="ALL">All Counties</option>
                    {COUNTIES.map(c => (
                      <option key={c} value={c}>{c} County</option>
                    ))}
                  </select>
                </div>

                {/* Constituency Text Match */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ward / Constituency" 
                    value={constituencyFilter}
                    onChange={(e) => setConstituencyFilter(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#004d2c]"
                  />
                </div>

              </div>

              {/* Status Drop Badges Filter */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'REJECTED'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setStatusFilter(filterVal)}
                    className={`px-4.5 h-10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      statusFilter === filterVal 
                        ? 'bg-[#004d2c] text-white border-[#004d2c] shadow-sm' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    {filterVal === 'ALL' ? 'All Complaints' : filterVal.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Table Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-150 shadow-sm overflow-hidden text-left">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Resolution Workflow Queue</h3>
                  <p className="text-xs text-slate-405 font-medium leading-normal mt-0.5">Showing {filteredIssues.length} matching civic complaints</p>
                </div>
                {selectedIssueId && (
                  <button 
                    onClick={() => setSelectedIssueId(null)}
                    className="text-xs font-black text-[#004d2c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Expand Work Queue <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 bg-slate-50/50">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[40%]">Incident Context</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[25%]">Region & Boundary</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[20%]">Status Action</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[15%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIssues.length > 0 ? (
                      filteredIssues.map((issue) => (
                        <tr 
                          key={issue.id} 
                          onClick={() => setSelectedIssueId(issue.id)}
                          className={`hover:bg-slate-50/70 transition-colors cursor-pointer group ${
                            selectedIssueId === issue.id ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-1.5 select-none text-left">
                              <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#004d2c] transition-colors leading-snug">
                                {issue.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                  ID: {issue.id.split('_')[1] || issue.id.slice(-6)}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-[9px] font-black text-[#004d2c] uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {issue.category}
                                </span>
                                {issue.status === 'REOPENED' && (
                                  <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-1.5 uppercase animate-pulse">
                                    ⚠️ Reopened
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-6 text-left">
                            <div className="flex flex-col gap-1.5 text-xs">
                              <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#004d2c]" />
                                {issue.location.county}
                              </span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-5 truncate max-w-[170px]">
                                {issue.location.constituency ? `Constituency: ${issue.location.constituency}` : issue.location.address}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={issue.status}
                              onChange={(e) => handleUpdateStatus(issue.id, e.target.value as IssueStatus)}
                              className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl border outline-none cursor-pointer transition-colors ${
                                issue.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                issue.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                issue.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                issue.status === 'REOPENED' ? 'bg-rose-50 text-rose-800 border-rose-250' :
                                issue.status === 'REJECTED' ? 'bg-red-50 text-red-800 border-red-200' :
                                'bg-slate-50 text-slate-800 border-slate-200'
                              }`}
                            >
                              <option value="SUBMITTED">SUBMITTED</option>
                              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="RESOLVED">RESOLVED</option>
                              <option value="REOPENED">REOPENED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                          
                          <td className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setSelectedIssueId(issue.id)}
                              className="h-10 px-4 bg-slate-50 group-hover:bg-[#004d2c] group-hover:text-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              View Detail
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest leading-loose">
                          <Map className="w-8 h-8 text-slate-350 mx-auto mb-3" />
                          No pending reports found for selected combination.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Slider Detail Panel Column (Rendered only when issue is selected) */}
          {selectedIssue && (
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 hover:border-[#004d2c]/20 transition-all duration-300 relative text-left">
              
              {/* Close Panel Header */}
              <button 
                onClick={() => setSelectedIssueId(null)}
                className="absolute right-6 top-6 p-2 bg-slate-50 text-slate-405 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                title="Close Details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-8">
                
                {/* Meta details banner */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3  py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[9px] uppercase tracking-wider border border-emerald-150">
                    🛠️ Administrative Panel
                  </div>
                  <h3 className="text-xl font-black text-slate-950 leading-snug tracking-tight font-display pr-6">
                    {selectedIssue.title}
                  </h3>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Reported by: <span className="text-slate-800">{selectedIssue.reporterName}</span> • {format(new Date(selectedIssue.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>

                <hr className="border-slate-100" />

                {/* Evidence Image Section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Photo Evidence
                  </h4>
                  {selectedIssue.images && selectedIssue.images.length > 0 ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative group">
                      <img 
                        src={selectedIssue.images[0]} 
                        alt="Evidence" 
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/65 text-slate-400 text-xs font-semibold text-center select-none">
                      No photographic evidence attached.
                    </div>
                  )}
                </div>

                {/* Main Issue Description */}
                <div className="space-y-1.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Citizen Complaint description</h4>
                  <p className="text-slate-600 font-medium leading-relaxed max-h-32 overflow-y-auto">
                    {selectedIssue.description}
                  </p>
                </div>

                {/* Support and Vote indicators */}
                <div className="grid grid-cols-2 gap-4 bg-emerald-50/20 p-4 rounded-2xl border border-[#004d2c]/10 text-xs">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Democracy Support</span>
                    <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-1">
                      <ThumbsUp className="w-4 h-4 text-[#004d2c]" />
                      {selectedIssue.upvotes} Votes
                    </span>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Comments Activity</span>
                    <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-1">
                      <MessageSquare className="w-4 h-4 text-[#004d2c]" />
                      {comments.length} Posts
                    </span>
                  </div>
                </div>

                {/* GPS and Location Boundary coordinates */}
                <div className="bg-slate-50/45 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-405 tracking-wider flex items-center gap-1">
                    <MapPinned className="w-4 h-4 text-[#004d2c]" /> GPS Position Coordinates
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-600 leading-relaxed"><span className="font-black text-slate-800">Address:</span> {selectedIssue.location.address}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
                      LAT: {selectedIssue.location.lat.toFixed(4)} • LNG: {selectedIssue.location.lng.toFixed(4)}
                    </p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedIssue.location.lat},${selectedIssue.location.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#004d2c] uppercase tracking-wider hover:underline mt-1 pt-1 border-t border-slate-100 w-full"
                  >
                    <Map className="w-3.5 h-3.5" /> View position on live satellite map
                  </a>
                </div>

                <hr className="border-slate-100" />

                {/* Quick Status Command actions */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Immediate Executive Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleMarkAsResolved}
                      disabled={isSavingDetails}
                      className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/10 transition-transform active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                    <button
                      onClick={handleRejectReport}
                      disabled={isSavingDetails}
                      className="w-full h-11 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-rose-200/50 flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                    >
                      <Ban className="w-3.5 h-3.5" /> Reject Report
                    </button>
                  </div>
                </div>

                {/* Form to Modify Admin notes and details */}
                <form onSubmit={handleSaveAdminDetails} className="space-y-4">
                  {saveStatus && (
                    <div className={`p-4 rounded-xl text-xs font-black ${
                      saveStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {saveStatus.message}
                    </div>
                  )}

                  {/* Constituency / Ward verification */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Verify Constituency / Ward</label>
                    <input 
                      type="text" 
                      value={constituencyVal}
                      onChange={(e) => setConstituencyVal(e.target.value)}
                      placeholder="e.g. Westlands Constituency"
                      className="w-full h-10 px-3.5 bg-[#fafbfa] border border-slate-200 focus:outline-[#004d2c] rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Assignee Team / Contractor */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Assign Dispatch Officer / Department</label>
                    <input 
                      type="text" 
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="e.g. County Roads Contractor Team A"
                      className="w-full h-10 px-3.5 bg-[#fafbfa] border border-slate-200 focus:outline-[#004d2c] rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Admin notes */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 font-sans">Official Public updates (Admin Notes)</label>
                    <textarea 
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Input public update regarding review, scheduling, or technical reasons..."
                      className="w-full h-20 p-3 bg-[#fafbfa] border border-slate-200 focus:outline-[#004d2c] rounded-xl text-xs font-semibold text-slate-800 resize-none font-sans"
                    />
                  </div>

                  {/* Contractor/Action specifications */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Private Dispatch Instructions (Action Notes)</label>
                    <textarea 
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Input inner directives for contractors or maintenance personnel..."
                      className="w-full h-20 p-3 bg-[#fafbfa] border border-slate-200 focus:outline-[#004d2c] rounded-xl text-xs font-semibold text-slate-800 resize-none font-sans"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSavingDetails}
                    className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl border-none shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> Save Directives
                  </Button>
                </form>

                <hr className="border-slate-100" />

                {/* Citizen Discussion stream in slider */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 select-none">
                    <MessageSquare className="w-3.5 h-3.5" /> Citizen Discussion Thread
                  </h4>

                  {comments.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                            <span>{comment.userName}</span>
                            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                          </div>
                          <p className="text-slate-655 font-medium leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic text-center py-4 bg-slate-50 border border-slate-150 border-dashed rounded-xl">
                      No citizen comments recorded on this report.
                    </p>
                  )}

                  {/* Fast Admin response Comment form */}
                  <form onSubmit={handlePostAdminComment} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add official administrative comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-grow h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-[#004d2c]"
                    />
                    <button 
                      type="submit"
                      className="h-10 w-10 bg-[#004d2c] hover:bg-[#003820] text-white rounded-xl flex items-center justify-center border-none cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
