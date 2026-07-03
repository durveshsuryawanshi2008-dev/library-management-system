export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  prn: string;
  role: UserRole;
  walletBalance?: number;
}

export interface Book {
  id: string;
  code: string;
  title: string;
  author: string;
  copies: number;
  section: string;
  category: string;
  department: string;
  isAvailable?: boolean;
}

export interface ChatMessage {
  id: string;
  senderPrn: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface IssueRecord {
  id: string;
  bookId: string;
  bookCode: string;
  bookTitle: string;
  author: string;
  studentName: string;
  studentPrn: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'accepted' | 'returned' | 'rejected' | 'return_pending';
  returnRequestedDate?: string;
  fineAmount?: number;
}
