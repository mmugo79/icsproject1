export type IssueStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'REJECTED';

export type IssueCategory = 
  | 'ROADS' 
  | 'WATER' 
  | 'ELECTRICITY' 
  | 'WASTE'; 

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICIAL';
  avatar?: string;
  county?: string; 
  assignedCategories?: IssueCategory[];
  institution?: string;
  phone?: string;
  ward?: string;
  age?: number;
  constituency?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
    county: string;
    constituency?: string;
  };
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  upvotes: number;
  commentsCount: number;
  supporterIds?: string[];
  adminNotes?: string;
  actionNotes?: string;
  assignedTo?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}
