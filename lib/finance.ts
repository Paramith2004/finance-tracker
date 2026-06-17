export type TransactionType = 'income' | 'expense';

export type Category =
    | 'Salary' | 'Freelance' | 'Investment' | 'Other Income'
    | 'Food' | 'Transport' | 'Housing' | 'Entertainment'
    | 'Health' | 'Shopping' | 'Education' | 'Other Expense';

export interface Transaction {
    id: string;
    type: TransactionType;
    category: Category;
    amount: number;
    description: string;
    date: string;
}

export const INCOME_CATEGORIES: Category[] = ['Salary', 'Freelance', 'Investment', 'Other Income'];
export const EXPENSE_CATEGORIES: Category[] = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other Expense'];

export const CATEGORY_ICONS: Record<Category, string> = {
    'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Other Income': '💰',
    'Food': '🍛', 'Transport': '🚗', 'Housing': '🏠', 'Entertainment': '🎬',
    'Health': '🏥', 'Shopping': '🛍️', 'Education': '📚', 'Other Expense': '💸'
};

export const CATEGORY_COLORS: Record<Category, string> = {
    'Salary': '#4ade80', 'Freelance': '#34d399', 'Investment': '#6ee7b7', 'Other Income': '#a7f3d0',
    'Food': '#f87171', 'Transport': '#fb923c', 'Housing': '#fbbf24', 'Entertainment': '#a78bfa',
    'Health': '#60a5fa', 'Shopping': '#f472b6', 'Education': '#38bdf8', 'Other Expense': '#94a3b8'
};

export const getTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('finance_transactions');
    return data ? JSON.parse(data) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
    const transactions = getTransactions();
    const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
    saveTransactions([newTransaction, ...transactions]);
    return newTransaction;
};

export const deleteTransaction = (id: string) => {
    const transactions = getTransactions();
    saveTransactions(transactions.filter(t => t.id !== id));
};

export const getStats = (transactions: Transaction[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
};