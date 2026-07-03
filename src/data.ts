import { Book } from './types';

export const MOCK_BOOKS: Book[] = [
  { id: '1', code: 'PY001', title: 'Python Programming', author: 'Guido van Rossum', isAvailable: true, copies: 5, section: 'A1', category: 'Programming', department: 'General' },
  { id: '2', code: 'DS101', title: 'Data Structures', author: 'Mark Weiss', isAvailable: true, copies: 3, section: 'B2', category: 'Core', department: 'General' },
  { id: '3', code: 'AI202', title: 'Artificial Intelligence', author: 'Stuart Russell', isAvailable: true, copies: 2, section: 'C3', category: 'Advanced', department: 'General' },
  { id: '4', code: 'DB303', title: 'Database Systems', author: 'Abraham Silberschatz', isAvailable: true, copies: 4, section: 'D4', category: 'Core', department: 'General' },
  { id: '5', code: 'NW404', title: 'Computer Networks', author: 'Andrew Tanenbaum', isAvailable: true, copies: 6, section: 'E5', category: 'Infrastructure', department: 'General' },
];

export const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export const calculateDueDate = (issueDate: string) => {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + 15);
  return date.toISOString();
};
