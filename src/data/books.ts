import { Book } from '../types';

const mainCategories = ['FY', 'SY', 'TY', 'General'];
const subCategories: Record<string, string[]> = {
  'FY': ['Basic Electronics', 'Mathematics I', 'Communication Skills', 'Physics'],
  'SY': ['Data Structures', 'Microprocessors', 'Database Systems', 'Mathematics II'],
  'TY': ['Artificial Intelligence', 'Cloud Computing', 'Cyber Security', 'Project Management'],
  'General': ['UPSC Essentials', 'MPSC Guide', 'Indian History', 'Programming (C/C++)', 'Python Advanced']
};

const authors = [
  'Laxmikanth', 'Bipan Chandra', 'R.S. Aggarwal', 'Vinay Sahasrabuddhe', 
  'Durvesh S.', 'E. Balagurusamy', 'Yashavant Kanetkar', 'A.P.J. Abdul Kalam'
];

export const generateBooks = (count: number): Book[] => {
  const books: Book[] = [];
  for (let i = 1; i <= count; i++) {
    const mainCat = mainCategories[Math.floor(Math.random() * mainCategories.length)];
    const subs = subCategories[mainCat];
    const subCat = subs[Math.floor(Math.random() * subs.length)];
    
    books.push({
      id: `BK-${100000 + i}`,
      code: `${mainCat.substring(0, 1)}${subCat.substring(0, 2).toUpperCase()}${i}`,
      title: `${subCat} - Reference Vol. ${i}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      copies: Math.floor(Math.random() * 5) + 1,
      section: `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
      category: subCat,
      department: mainCat as any
    });
  }
  return books;
};

export const ALL_BOOKS = generateBooks(20000); 
