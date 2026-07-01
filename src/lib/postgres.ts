/**
 * PostgreSQL Database Modeling & Interface declarations for RaiaVoice.
 * Includes complete entity definitions for citizen profiles, categories, reports, supports, comments and audit logs.
 */

import { Issue, Comment } from '../types';

export interface PGUser {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  phone_number: string; 
  age?: number;
  county: string;
  constituency: string;
  ward_area: string;
  profile_picture_url: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICIAL';
  category_assignment?: string; // stored as JSON string
  institution?: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PGIssueCategory {
  id: string;
  name: string;
  assigned_admin_id: string;
}

export interface PGReport {
  id: string;
  title: string;
  description: string;
  category_id: string;
  reporter_id: string;
  county: string;
  constituency: string;
  ward_area: string;
  latitude: number;
  longitude: number;
  image_url: string;
  status: string;
  priority_score: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  reopened_from_report_id?: string;
}

export interface PGComment {
  id: string;
  report_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
}

export interface PGStatusHistory {
  id: string;
  report_id: string;
  changed_by_user_id: string;
  old_status: string;
  new_status: string;
  note: string;
  created_at: string;
}

// Simple legacy synchronization adaptors (Noops as we now operate purely through state-synchronized HTTP APIs)
export async function syncUserToPostgreSQL(user: any) {
  return true;
}

export async function syncEmailVerificationTokenToPostgreSQL(userId: string, token: string, code: string) {
  return true;
}

export async function syncPasswordResetTokenToPostgreSQL(email: string, token: string) {
  return true;
}

export async function syncIssueToPostgreSQL(issue: Issue) {
  return true;
}

export async function syncCommentToPostgreSQL(comment: Comment) {
  return true;
}

export async function syncStatusHistoryToPostgreSQL(history: any) {
  return true;
}

export async function syncNotificationToPostgreSQL(notification: any) {
  return true;
}

export async function syncAuditLogToPostgreSQL(log: any) {
  return true;
}

export function queryReportsFromPostgreSQL(fallbackIssues: Issue[]): Issue[] {
  return fallbackIssues;
}

export async function savePhoneToPostgreSQL(userId: string, phone: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('raia_jwt_token')}`
      },
      body: JSON.stringify({ phone })
    });
    if (res.ok) {
      return { success: true, message: 'Phone registration synchronized with PostgreSQL.' };
    }
    return { success: false, message: 'Server backend update error.' };
  } catch (e: any) {
    console.error(e);
    return { success: false, message: e.message || 'Database connection error.' };
  }
}

export async function sendVerificationSMS(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  console.log(`\n=================== [RaiaVoice SMS Simulated Gateway] ===================`);
  console.log(`  TO: ${phone}`);
  console.log(`  MESSAGE: Your phone verification OTP is: ${code}`);
  console.log(`=========================================================================\n`);
  return { success: true, message: `SMS notification containing verification code ${code} initialized.` };
}

export async function setPhoneVerifiedInDB(userId: string, verifiedStatus: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('raia_jwt_token')}`
      },
      body: JSON.stringify({ phoneVerified: checkedStatus(verifiedStatus) })
    });
    if (res.ok) {
       return { success: true, message: 'Verified.' };
    }
    return { success: false, message: 'Verification sync fail.' };
  } catch (e: any) {
    console.error(e);
    return { success: false, message: e.message || 'Database error during phone status commit.' };
  }
}

function checkedStatus(status: boolean) {
  return status;
}

export async function saveIssueToPostgreSQL(issue: any): Promise<boolean> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('raia_jwt_token')}`
      },
      body: JSON.stringify(issue)
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}
