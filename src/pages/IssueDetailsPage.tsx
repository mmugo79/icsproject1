import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { getIssues, updateIssueStatus, upvoteIssue, getComments, saveComment, reopenIssue, getStatusHistory, StatusHistory } from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Share2,  
  AlertCircle,
  Send,
  ArrowBigUp,
  CheckCircle2,
  Lock 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Issue, Comment } from '@/types';

export function IssueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [historyLogs, setHistoryLogs] = React.useState<StatusHistory[]>([]);
  const [commentText, setCommentText] = React.useState('');
  const [commentError, setCommentError] = React.useState('');
  const [showReopenForm, setShowReopenForm] = React.useState(false);
  const [reopenReason, setReopenReason] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const all = getIssues();
    const found = all.find(i => i.id === id) || null;
    setIssue(found);
    
    if (id) {
      setComments(getComments(id));
      getStatusHistory(id).then(logs => {
        setHistoryLogs(logs);
      });
    }
  }, [id]);

  React.useEffect(() => {
    const handleUpdate = () => {
      const all = getIssues();
      const found = all.find(i => i.id === id) || null;
      setIssue(found);
      if (id) {
        getStatusHistory(id).then(logs => {
          setHistoryLogs(logs);
        });
      }
    };
    window.addEventListener('raia_issues_updated', handleUpdate);
    return () => {
      window.removeEventListener('raia_issues_updated', handleUpdate);
    };
  }, [id]);

  const handleUpvote = () => {
    if (id && issue) {
      upvoteIssue(id);
      const all = getIssues();
      const found = all.find(i => i.id === id) || null;
      setIssue(found);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!user) {
      setCommentError('You must be logged in to join the conversation.');
      return;
    }
    if (!commentText.trim()) {
      return;
    }

    const newComment: Comment = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      issueId: id || '',
      userId: user.id,
      userName: user.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    saveComment(newComment);
    setCommentText('');
    setComments(getComments(id || ''));
    
    // Refresh parent issue to show accurate commentsCount
    const all = getIssues();
    const found = all.find(i => i.id === id) || null;
    setIssue(found);
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && issue && reopenReason.trim()) {
      await reopenIssue(id, reopenReason.trim());
      const all = getIssues();
      const found = all.find(i => i.id === id) || null;
      setIssue(found);
      setShowReopenForm(false);
      setReopenReason('');
    }
  };

  if (!issue) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Report Not Found</h2>
          <p className="text-slate-500 font-medium">The specified civic report either does not exist or has been archived.</p>
          <Link to="/feed">
            <Button className="h-12 px-6 bg-[#004d2c] text-white font-extrabold uppercase rounded-xl border-none shadow-md">
              Return to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = {
    SUBMITTED: { label: 'Received', desc: 'Report has been successfully submitted and is visible to the public.' },
    UNDER_REVIEW: { label: 'Under Review', desc: 'The issue is being analyzed and evaluated by the designated authorities.' },
    IN_PROGRESS: { label: 'Active Investigation', desc: 'Authorities have acknowledged the report and are scheduling resolution actions.' },
    RESOLVED: { label: 'Issue Resolved', desc: 'The reported problem has been actioned, resolved, and marked complete by administrative officials.' },
    REOPENED: { label: 'Reopened', desc: 'This resolved issue was flagged as persistent or unverified and is reopened for active review.' },
    REJECTED: { label: 'Closed Without Action', desc: 'Report was declined due to insufficient evidence, duplication, or incorrect classification.' },
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-8">
          <Link to="/feed" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#004d2c] font-bold group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Feed
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-10 text-left">
            {/* Header Content */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge category={issue.category} />
                <Badge status={issue.status} />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                {issue.title}
              </h1>
              <div className="flex items-center gap-6 font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-xs text-slate-600">
                    {issue.reporterName ? issue.reporterName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="text-sm">{issue.reporterName || 'Anonymous Citizen'}</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Main Image */}
            {issue.images && issue.images.length > 0 && issue.images[0] ? (
              <div className="aspect-video rounded-[3rem] overflow-hidden bg-white p-3 shadow-xl border border-slate-200">
                <img src={issue.images[0]} alt={issue.title} className="w-full h-full object-cover rounded-[2.5rem]" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="aspect-video rounded-[3rem] overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <AlertCircle className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-bold">No Image Attached</p>
                <p className="text-xs max-w-xs mt-1">This report was submitted by citizen without accompanying photo evidence.</p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Report Description</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-semibold">
                {issue.description}
              </p>
            </div>

            {/* Public Admin Notes */}
            {issue.adminNotes && (
              <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-[2.5rem] p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600/10 text-emerald-800 rounded-xl flex items-center justify-center font-bold">
                    📢
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none">Official Public Update</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Provided by county registry</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-600 bg-white border border-slate-100 p-4 rounded-2xl leading-relaxed whitespace-pre-wrap">
                  {issue.adminNotes}
                </div>
              </div>
            )}

            {/* Private Admin Action Notes */}
            {user && user.role === 'ADMIN' && issue.actionNotes && (
              <div className="bg-[#edf6ff] border border-blue-250 rounded-[2.5rem] p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none">Private Dispatch Instructions</h4>
                    <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Official/Admin verification only</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-600 bg-white border border-blue-100 p-4 rounded-2xl leading-relaxed whitespace-pre-wrap">
                  {issue.actionNotes}
                </div>
              </div>
            )}

            {/* Location Section */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 bg-[#004d2c]/5 border border-[#004d2c]/10 rounded-2xl flex items-center justify-center text-[#004d2c] flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-left">
                  <h4 className="text-lg font-black text-slate-900">Geographical Position</h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{issue.location.address}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                    {issue.location.constituency ? `${issue.location.constituency}, ` : ''}{issue.location.county} County • Ward Verified
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  navigate(`/map?issueId=${issue.id}`);
                }}
                className="h-12 px-6 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold uppercase rounded-xl border-none shadow-md text-xs tracking-wider shrink-0 w-full md:w-auto cursor-pointer"
              >
                Open in Maps
              </Button>
            </div>

            {/* Comments Section */}
            <div className="space-y-10 pt-10 border-t border-slate-200">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                Citizen Discussion <span className="text-[#004d2c]">({comments.length})</span>
              </h3>

              <div className="space-y-8">
                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="flex gap-6 group text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#004d2c] flex items-center justify-center flex-shrink-0 text-white font-black">
                    {user ? user.name[0].toUpperCase() : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-grow space-y-4">
                    {commentError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-150 inline-block">{commentError}</p>
                    )}
                    <textarea 
                      placeholder={user ? "Add your voice to the conversation..." : "Please sign in to join the discussion."}
                      className="w-full min-h-[100px] p-5 bg-white rounded-3xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#004d2c] transition-all font-semibold text-slate-700 resize-none shadow-sm text-sm"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={!user}
                    />
                    {user && (
                      <div className="flex justify-end">
                        <Button type="submit" className="h-12 gap-2 px-8 bg-[#004d2c] hover:bg-[#003820] text-white shadow-lg rounded-xl font-black uppercase tracking-widest text-xs border-none">
                          Post Comment <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </form>

                <div className="h-px bg-slate-200 w-full" />

                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-6 animate-in fade-in duration-300 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-slate-200 border border-slate-350 text-slate-700 font-extrabold flex items-center justify-center flex-shrink-0">
                          {comment.userName ? comment.userName[0].toUpperCase() : 'C'}
                        </div>
                        <div className="space-y-2 flex-grow">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-slate-950 text-sm">{comment.userName}</h5>
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed text-sm">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-3xl text-slate-400 text-sm">
                    No comments yet. Start the citizen discussion!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Status & Sidebar */}
          <div className="space-y-8 text-left">
            {/* Status Timeline Card */}
            <div className="bg-slate-900 rounded-[3rem] text-white p-8 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-20 group-hover:scale-150 transition-transform duration-1000" />
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ccebda] mb-8 items-center flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Status Trail
              </h4>
              
              <div className="flex items-center justify-between mb-6">
                <Badge status={issue.status} className="border-white/15 bg-white/10 text-white" />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">{format(new Date(issue.updatedAt), 'MMM dd, HH:mm')}</span>
              </div>
              
              <h2 className="text-2xl font-black mb-4 tracking-tight">{statusInfo[issue.status].label}</h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-8 italic">
                "{statusInfo[issue.status].desc}"
              </p>

              <div className="space-y-6 relative">
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-white/10" />
                
                {[
                  { label: 'Report Submitted', done: true, time: format(new Date(issue.createdAt), 'MMM d, yyyy') },
                  { label: 'Administrative Review', done: issue.status !== 'SUBMITTED', time: issue.status === 'UNDER_REVIEW' ? 'Under Review' : (issue.status !== 'SUBMITTED' ? 'Checked' : 'Awaiting') },
                  { label: 'Resolution In Progress', done: issue.status === 'IN_PROGRESS' || issue.status === 'RESOLVED' || issue.status === 'REOPENED', time: issue.status === 'IN_PROGRESS' ? 'Active' : (issue.status === 'RESOLVED' ? 'Completed' : (issue.status === 'REOPENED' ? 'Reopened' : 'Pending')) },
                  { label: 'Action Completed', done: issue.status === 'RESOLVED', time: issue.status === 'RESOLVED' ? 'Fixed' : 'Pending' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${item.done ? 'bg-[#004d2c] border-[#004d2c] text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                      {item.done ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={`text-xs font-black ${item.done ? 'text-white' : 'text-slate-500'}`}>{item.label}</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Status History Tracks */}
              {historyLogs && historyLogs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ccebda]">
                    Historical Transitions
                  </h5>
                  <div className="space-y-3">
                    {historyLogs.map((log) => (
                      <div key={log.id} className="text-xs bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-extrabold text-emerald-400">
                            {log.prevStatus} → {log.status}
                          </span>
                          <span>
                            {log.createdAt ? format(new Date(log.createdAt), 'MMM d, H:mm') : ''}
                          </span>
                        </div>
                        <p className="text-slate-300 font-semibold text-xs leading-relaxed">
                          {log.notes}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          Changed by: <span className="text-emerald-400 font-bold">{log.changedByName || 'Administrator'}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interaction Card */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm text-center">
              <h4 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Support Accountability</h4>
              <div className="flex flex-col gap-4">
                {user && issue.supporterIds?.includes(user.id) ? (
                  <Button size="lg" disabled className="h-14 gap-3 text-sm font-extrabold bg-[#dfeae0] text-[#004d2c] border-none cursor-not-allowed w-full">
                    <CheckCircle2 className="w-5 h-5" /> Upvoted & Supported ({issue.upvotes})
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleUpvote} className="h-14 gap-3 text-sm font-extrabold shadow-lg bg-[#004d2c] hover:bg-[#003820] text-white border-none cursor-pointer w-full">
                    <ArrowBigUp className="w-5 h-5" /> Upvote Report ({issue.upvotes})
                  </Button>
                )}

                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={async () => {
                    const shareData = {
                      title: issue.title,
                      text: issue.description,
                      url: window.location.href,
                    };
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }} 
                  className="h-14 gap-3 text-sm font-extrabold shadow-sm border-slate-200 text-slate-600 hover:text-[#004d2c] hover:border-[#004d2c] rounded-2xl cursor-pointer w-full"
                >
                  <Share2 className="w-4 h-4" /> {copied ? 'Copied Link!' : 'Share Status Report'}
                </Button>
              </div>
              <p className="mt-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                {issue.upvotes} {issue.upvotes === 1 ? 'citizen verified' : 'citizens verified'} this concern.
              </p>
            </div>

            {/* Reopen resolved/rejected button */}
            {user && (issue.status === 'RESOLVED' || issue.status === 'REJECTED') && (
              <div className="bg-amber-50 rounded-[3rem] p-8 border border-amber-200 shadow-sm text-center animate-in fade-in duration-300">
                <h4 className="text-lg font-black text-amber-900 mb-3 uppercase tracking-tight">Reopen Report</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                  If the stated resolution is unverified or the issue persists, reopen this report to request further action.
                </p>
                
                {!showReopenForm ? (
                  <Button 
                    onClick={() => setShowReopenForm(true)} 
                    className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md rounded-2xl border-none uppercase tracking-widest text-[10px]"
                  >
                    Confirm Reopen Report
                  </Button>
                ) : (
                  <form onSubmit={handleReopenSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Reason or New Evidence</label>
                      <textarea
                        required
                        placeholder="Please describe why this issue is still unverified or the problem persists..."
                        className="w-full min-h-[100px] p-4 bg-white border border-amber-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-sm text-slate-700 resize-none shadow-sm"
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        onClick={() => {
                          setShowReopenForm(false);
                          setReopenReason('');
                        }} 
                        className="flex-1 h-12 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl border-none uppercase tracking-widest text-[9px]"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl border-none uppercase tracking-widest text-[9px] shadow-sm"
                      >
                        Submit Reopen
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Importance Indicator */}
            <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-200 flex flex-col items-center text-center">
              <AlertCircle className="text-[#004d2c] w-6 h-6 mb-3" />
              <h4 className="text-lg font-black text-slate-900 mb-1">Democratic Weight</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                This community issue holds priority standing based on upvotes from the regional {issue.location.county} registry.
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-[#004d2c] h-full" 
                  style={{ width: `${Math.min(100, Math.max(15, (issue.upvotes / 300) * 100))}%` }} 
                />
              </div>
              <p className="mt-3 text-[9px] font-black uppercase text-[#004d2c] tracking-widest">
                {Math.min(100, Math.round((issue.upvotes / 300) * 100))}% Impact Score
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
