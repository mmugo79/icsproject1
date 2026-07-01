import { Issue, Comment } from '@/types';

export interface AuditLog {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  action: string;
  details: string; 
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  issueId: string;
  prevStatus: string;
  status: string;
  changedBy: string;
  changedByName: string;
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
}

// Global cached issues in-memory, fast fallback
let cachedIssues: Issue[] = [];

// Load from localStorage for offline/instant initial page loads
try {
  const saved = localStorage.getItem('raia_issues');
  if (saved) {
    cachedIssues = JSON.parse(saved);
  }
} catch (e) {}

// Setup helper headers with JWT session token
function getHeaders() {
  const token = localStorage.getItem('raia_jwt_token');
  return token ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  } : {
    'Content-Type': 'application/json'
  };
}

// Fetches reports from real PostgreSQL database automatically
export async function refreshIssues() {
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      cachedIssues = data;
      localStorage.setItem('raia_issues', JSON.stringify(data));
      window.dispatchEvent(new Event('raia_issues_updated'));
    }
  } catch (err) {
    console.error("Failed to query reports from PostgreSQL:", err);
  }
}

// Synchronizes on intervals or on triggers
let syncInterval: any = null;

export function startIssuesSync() {
  refreshIssues();
  if (!syncInterval) {
    syncInterval = setInterval(refreshIssues, 10000); // refresh every 10 seconds
  }
}

export function stopIssuesSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// Manage issues reactively
export function getIssues(): Issue[] {
  return cachedIssues;
}

// Save Audit Log (handled on server side)
export async function saveAuditLog(issueId: string, action: string, details: string) {
  return true;
}

// Send Notification (handled on server side)
export async function saveNotification(userId: string, notification: Notification) {
  return true;
}

// Save reported issue
export async function saveIssue(issue: Issue) {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(issue)
    });
    if (res.ok) {
      await refreshIssues();
    } else {
      console.error("Failed to submit issue to PostgreSQL database");
    }
  } catch (error) {
    console.error("Fail writing issue record to PostgreSQL database: ", error);
  }
}

// Fetch comments dynamically from backend
export async function fetchCommentsAsync(issueId: string) {
  try {
    const res = await fetch(`/api/reports/${issueId}/comments`);
    if (res.ok) {
      const fetched: Comment[] = await res.json();
      
      const saved = localStorage.getItem('raia_comments');
      let allComments: Comment[] = [];
      if (saved) {
        try {
          allComments = JSON.parse(saved);
        } catch (e) {}
      }
      
      allComments = allComments.filter(c => c.issueId !== issueId);
      allComments.push(...fetched);
      localStorage.setItem('raia_comments', JSON.stringify(allComments));
      window.dispatchEvent(new Event('raia_issues_updated'));
    }
  } catch (error) {
    console.error("Error fetching comments from PostgreSQL: ", error);
  }
}

export function getComments(issueId: string): Comment[] {
  // Fetch latest comments in background
  fetchCommentsAsync(issueId);

  // Return locally cached records immediately for responsive render
  const saved = localStorage.getItem('raia_comments');
  if (saved) {
    try {
      const allComments: Comment[] = JSON.parse(saved);
      return allComments.filter(c => c.issueId === issueId);
    } catch (e) {}
  }
  return [];
}

// Add comments on specific issue reports
export async function saveComment(comment: Comment) {
  try {
    const res = await fetch(`/api/reports/${comment.issueId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(comment)
    });
    if (res.ok) {
      await fetchCommentsAsync(comment.issueId);
      await refreshIssues();
    }
  } catch (error) {
    console.error("Failed to post comment to PostgreSQL database: ", error);
  }
}

// Update report statuses securely (Administrative)
export function updateIssueStatus(id: string, status: Issue['status']): Issue[] {
  fetch(`/api/reports/${id}/admin`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(res => {
    if (res.ok) refreshIssues();
  });

  // Instantly update local cache to preserve responsive UI
  cachedIssues = cachedIssues.map(item => {
    if (item.id === id) {
      return { ...item, status, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  return cachedIssues;
}

// Reopen a resolved issue with note/evidence
export async function reopenIssue(id: string, reason: string): Promise<Issue[]> {
  try {
    const res = await fetch(`/api/reports/${id}/reopen`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      await refreshIssues();
    }
  } catch (error) {
    console.error("Failed to reopen issue: ", error);
  }
  return cachedIssues;
}

// Citizen upvoting logic (persisted in report_supports)
export function upvoteIssue(id: string): Issue[] {
  fetch(`/api/reports/${id}/upvote`, {
    method: 'POST',
    headers: getHeaders()
  }).then(res => {
    if (res.ok) refreshIssues();
  });

  // Fetch current user from local JWT if available
  const token = localStorage.getItem('raia_jwt_token');
  let currentUserId = 'system';
  if (token) {
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      currentUserId = decoded.id;
    } catch (e) {}
  }

  // Update locally instantly for beautiful responsive state transition
  cachedIssues = cachedIssues.map(item => {
    if (item.id === id) {
      const existingSupporters = item.supporterIds || [];
      return {
        ...item,
        upvotes: item.upvotes + 1,
        supporterIds: existingSupporters.includes(currentUserId) ? existingSupporters : [...existingSupporters, currentUserId]
      };
    }
    return item;
  });
  return cachedIssues;
}

// Mark notifications as read
export async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: getHeaders()
    });
  } catch (error) {
    console.error("Failed to mark notification as read in PostgreSQL: ", error);
  }
}

// Update report details by Administrator
export async function updateIssueAdminDetails(
  id: string,
  data: {
    status?: Issue['status'];
    adminNotes?: string;
    actionNotes?: string;
    assignedTo?: string;
    constituency?: string;
  }
): Promise<Issue[]> {
  try {
    const res = await fetch(`/api/reports/${id}/admin`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (res.ok) {
      await refreshIssues();
    }
  } catch (err) {
    console.error("Failed to commit administrative updates to PostgreSQL:", err);
  }
  return cachedIssues;
}

// Fetch status history for a specific issue
export async function getStatusHistory(issueId: string): Promise<StatusHistory[]> {
  try {
    const res = await fetch(`/api/reports/${issueId}/status-history`);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch status history from PostgreSQL: ", error);
  }
  return [];
}
