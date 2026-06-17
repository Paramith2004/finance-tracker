'use client';
import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Transaction, Category, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
    CATEGORY_ICONS, CATEGORY_COLORS, getTransactions, addTransaction,
    deleteTransaction, getStats
} from '@/lib/finance';

const gold = '#c9a84c';

const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    padding: '24px',
} as const;

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
};

const labelStyle = {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
};

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [form, setForm] = useState({
        type: 'expense' as 'income' | 'expense',
        category: 'Food' as Category,
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add'>('dashboard');
    const [message, setMessage] = useState('');

    useEffect(() => { setTransactions(getTransactions()); }, []);

    const stats = getStats(transactions);

    const handleAdd = () => {
        if (!form.amount || !form.description || !form.date) {
            setMessage('⚠️ Please fill in all fields!'); return;
        }
        addTransaction({
            type: form.type,
            category: form.category,
            amount: parseFloat(form.amount),
            description: form.description,
            date: form.date,
        });
        setTransactions(getTransactions());
        setForm({ type: 'expense', category: 'Food', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        setMessage('✅ Transaction added!');
        setTimeout(() => setMessage(''), 3000);
        setActiveTab('transactions');
    };

    const handleDelete = (id: string) => {
        deleteTransaction(id);
        setTransactions(getTransactions());
    };

    const filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || t.type === filterType;
        return matchSearch && matchType;
    });

    // Chart data
    const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
        name: cat,
        value: transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0),
        color: CATEGORY_COLORS[cat],
    })).filter(d => d.value > 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: transactions.filter(t => t.type === 'income' && t.date === dateStr).reduce((s, t) => s + t.amount, 0),
            expense: transactions.filter(t => t.type === 'expense' && t.date === dateStr).reduce((s, t) => s + t.amount, 0),
        };
    });

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>

            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at top, #1a1200 0%, #0a0a0a 60%)' }} />
            <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

            {/* Navbar */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', padding: '0 32px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `rgba(201,168,76,0.2)`, border: `1px solid rgba(201,168,76,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💰</div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '16px', color: gold, letterSpacing: '0.5px' }}>FinanceTracker</p>
                            <p style={{ fontSize: '11px', color: '#555' }}>Personal Budget Manager</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {(['dashboard', 'transactions', 'add'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                                background: activeTab === tab ? gold : 'transparent',
                                color: activeTab === tab ? '#000' : '#666',
                            }}>
                                {tab === 'dashboard' ? '📊' : tab === 'transactions' ? '📋' : '➕'} {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', padding: '8px 16px', textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#888' }}>Balance</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: stats.balance >= 0 ? '#4ade80' : '#f87171' }}>
                            Rs. {stats.balance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </nav>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>

                {message && (
                    <div style={{ background: message.includes('⚠️') ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${message.includes('⚠️') ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`, color: message.includes('⚠️') ? '#fbbf24' : '#4ade80', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
                        {message}
                    </div>
                )}

                {/* ── DASHBOARD TAB ── */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {[
                                { label: 'Total Balance', value: stats.balance, color: stats.balance >= 0 ? '#4ade80' : '#f87171', icon: '💳', bg: stats.balance >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: stats.balance >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' },
                                { label: 'Total Income', value: stats.income, color: '#4ade80', icon: '📈', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
                                { label: 'Total Expenses', value: stats.expenses, color: '#f87171', icon: '📉', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
                            ].map(s => (
                                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{s.label}</p>
                                        <span style={{ fontSize: '24px' }}>{s.icon}</span>
                                    </div>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>
                                        Rs. {Math.abs(s.value).toLocaleString()}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                                        {transactions.filter(t => t.type === (s.label.includes('Income') ? 'income' : s.label.includes('Expense') ? 'expense' : t.type)).length} transactions
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>

                            {/* Area Chart */}
                            <div style={card}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>📈 Last 7 Days</h3>
                                {transactions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                                        <p style={{ fontSize: '32px', marginBottom: '8px' }}>📊</p>
                                        <p>No data yet — add transactions!</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                                            <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" name="Expense" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Pie Chart */}
                            <div style={card}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>🥧 Expenses by Category</h3>
                                {expenseByCategory.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                                        <p style={{ fontSize: '32px', marginBottom: '8px' }}>🥧</p>
                                        <p>No expenses yet!</p>
                                    </div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                                                    {expenseByCategory.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                            {expenseByCategory.slice(0, 4).map(cat => (
                                                <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
                                                        <span style={{ fontSize: '12px', color: '#888' }}>{cat.name}</span>
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#ddd' }}>Rs. {cat.value.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '1px' }}>🕒 Recent Transactions</h3>
                                <button onClick={() => setActiveTab('transactions')} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: gold, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>View All</button>
                            </div>
                            {recentTransactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#444' }}>
                                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
                                    <p>No transactions yet</p>
                                    <button onClick={() => setActiveTab('add')} style={{ marginTop: '12px', background: gold, color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>+ Add First Transaction</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {recentTransactions.map(t => (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: t.type === 'income' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                                    {CATEGORY_ICONS[t.category]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: '#ddd', fontSize: '14px' }}>{t.description}</p>
                                                    <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <p style={{ fontWeight: 700, fontSize: '16px', color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                                                {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TRANSACTIONS TAB ── */}
                {activeTab === 'transactions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Filters */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                            <input style={inputStyle} placeholder="🔍 Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['all', 'income', 'expense'] as const).map(type => (
                                    <button key={type} onClick={() => setFilterType(type)} style={{
                                        padding: '12px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                                        border: 'none', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                                        background: filterType === type ? (type === 'income' ? 'rgba(34,197,94,0.2)' : type === 'expense' ? 'rgba(239,68,68,0.2)' : `rgba(201,168,76,0.2)`) : 'rgba(255,255,255,0.04)',
                                        color: filterType === type ? (type === 'income' ? '#4ade80' : type === 'expense' ? '#f87171' : gold) : '#666',
                                        border: filterType === type ? `1px solid ${type === 'income' ? 'rgba(34,197,94,0.4)' : type === 'expense' ? 'rgba(239,68,68,0.4)' : 'rgba(201,168,76,0.4)'}` : '1px solid rgba(255,255,255,0.06)',
                                    } as React.CSSProperties}>
                                        {type === 'all' ? '🔀' : type === 'income' ? '📈' : '📉'} {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Showing', value: filtered.length, suffix: ' records', color: gold },
                                { label: 'Income', value: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), prefix: 'Rs. ', color: '#4ade80' },
                                { label: 'Expenses', value: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), prefix: 'Rs. ', color: '#f87171' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#666' }}>{s.label}</span>
                                    <span style={{ fontWeight: 700, color: s.color, fontSize: '15px' }}>{s.prefix || ''}{typeof s.value === 'number' && s.prefix ? s.value.toLocaleString() : s.value}{s.suffix || ''}</span>
                                </div>
                            ))}
                        </div>

                        {/* Transaction List */}
                        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(201,168,76,0.08)', padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px' }}>
                                {['Transaction', 'Category', 'Date', 'Amount', ''].map(h => (
                                    <p key={h} style={{ fontSize: '11px', color: gold, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</p>
                                ))}
                            </div>
                            {filtered.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px', color: '#444' }}>
                                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                                    <p>No transactions found</p>
                                    <button onClick={() => setActiveTab('add')} style={{ marginTop: '16px', background: gold, color: '#000', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '13px' }}>+ Add Transaction</button>
                                </div>
                            ) : (
                                filtered.map((t, i) => (
                                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.type === 'income' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                                {CATEGORY_ICONS[t.category]}
                                            </div>
                                            <p style={{ fontWeight: 600, color: '#ddd', fontSize: '13px' }}>{t.description}</p>
                                        </div>
                                        <span style={{ background: `${CATEGORY_COLORS[t.category]}22`, color: CATEGORY_COLORS[t.category], padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>{t.category}</span>
                                        <p style={{ color: '#666', fontSize: '13px' }}>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p style={{ fontWeight: 700, fontSize: '14px', color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                                            {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                                        </p>
                                        <button onClick={() => handleDelete(t.id)} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── ADD TRANSACTION TAB ── */}
                {activeTab === 'add' && (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={card}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: gold, marginBottom: '8px' }}>➕ Add Transaction</h2>
                            <p style={{ fontSize: '13px', color: '#555', marginBottom: '28px' }}>Record your income or expense</p>

                            {/* Type Toggle */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <button onClick={() => setForm({ ...form, type: 'income', category: 'Salary' })} style={{ padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', border: `2px solid ${form.type === 'income' ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.08)'}`, background: form.type === 'income' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)', color: form.type === 'income' ? '#4ade80' : '#555', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    📈 Income
                                </button>
                                <button onClick={() => setForm({ ...form, type: 'expense', category: 'Food' })} style={{ padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', border: `2px solid ${form.type === 'expense' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`, background: form.type === 'expense' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', color: form.type === 'expense' ? '#f87171' : '#555', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    📉 Expense
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                {/* Category */}
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                        {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                            <button key={cat} onClick={() => setForm({ ...form, category: cat })} style={{
                                                padding: '10px 6px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                                border: `1px solid ${form.category === cat ? `${CATEGORY_COLORS[cat]}88` : 'rgba(255,255,255,0.06)'}`,
                                                background: form.category === cat ? `${CATEGORY_COLORS[cat]}22` : 'rgba(255,255,255,0.03)',
                                                color: form.category === cat ? CATEGORY_COLORS[cat] : '#555',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                                            }}>
                                                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{CATEGORY_ICONS[cat]}</div>
                                                <div style={{ fontSize: '11px' }}>{cat.replace(' ', '\n')}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label style={labelStyle}>Amount (Rs.)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '14px', fontWeight: 600 }}>Rs.</span>
                                        <input style={{ ...inputStyle, paddingLeft: '44px' }} type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={labelStyle}>Description</label>
                                    <input style={inputStyle} type="text" placeholder="e.g. Monthly salary, Lunch at work..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>

                                {/* Date */}
                                <div>
                                    <label style={labelStyle}>Date</label>
                                    <input style={{ ...inputStyle, colorScheme: 'dark' }} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>

                                {/* Preview */}
                                {form.amount && form.description && (
                                    <div style={{ background: form.type === 'income' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${form.type === 'income' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[form.category]}</span>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#ddd', fontSize: '14px' }}>{form.description}</p>
                                                <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{form.category} · {form.date}</p>
                                            </div>
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '20px', color: form.type === 'income' ? '#4ade80' : '#f87171' }}>
                                            {form.type === 'income' ? '+' : '-'} Rs. {parseFloat(form.amount || '0').toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                <button onClick={handleAdd} style={{ width: '100%', background: form.type === 'income' ? 'rgba(34,197,94,0.2)' : gold, border: form.type === 'income' ? '2px solid rgba(34,197,94,0.4)' : 'none', color: form.type === 'income' ? '#4ade80' : '#000', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px' }}>
                                    {form.type === 'income' ? '📈 Add Income' : '📉 Add Expense'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}