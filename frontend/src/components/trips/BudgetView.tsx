import React, { useState, useEffect } from 'react';
import { Trip, BudgetSummary, Expense, ExpenseCreateInput } from '../../types/trip';
import { fetchBudgetSummary, createExpense, updateExpense, deleteExpense } from '../../api/client';
import { ExpenseFormModal } from './ExpenseFormModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { Plus, DollarSign, PieChart, Wallet, CreditCard, TrendingDown, Edit, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface BudgetViewProps {
  trip: Trip;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ trip }) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBudgetSummary(trip.id);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load budget summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadBudget();
    }
  }, [trip?.id]);

  const handleSave = async (input: ExpenseCreateInput) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, input);
    } else {
      await createExpense(trip.id, input);
    }
    await loadBudget();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteExpense(deletingId);
      setDeletingId(null);
      await loadBudget();
    }
  };

  const formatMoney = (val?: string | number) => {
    const num = parseFloat(String(val || 0));
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Budget Tracker
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track estimated vs. actual expenses with exact Decimal precision.
          </p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
          Calculating budget statistics...
        </div>
      ) : summary ? (
        <>
          {/* Summary Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Card 1: Trip Budget */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Wallet size={16} />
                <span>TRIP BUDGET</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {formatMoney(summary.trip_budget_estimated)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Planned allocation
              </div>
            </div>

            {/* Card 2: Total Estimated Spending */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <CreditCard size={16} />
                <span>ESTIMATED SPENDING</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>
                {formatMoney(summary.total_estimated_spending)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Sum of estimated items
              </div>
            </div>

            {/* Card 3: Total Actual Spending */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <DollarSign size={16} />
                <span>ACTUAL SPENDING</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>
                {formatMoney(summary.total_actual_spending)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Sum of logged receipts
              </div>
            </div>

            {/* Card 4: Estimated Budget Remaining */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: parseFloat(summary.estimated_budget_remaining) >= 0 ? '#34d399' : '#f87171', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <TrendingDown size={16} />
                <span>EST. REMAINING</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: parseFloat(summary.estimated_budget_remaining) >= 0 ? '#34d399' : '#f87171' }}>
                {formatMoney(summary.estimated_budget_remaining)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Budget – Estimated
              </div>
            </div>

            {/* Card 5: Actual Budget Remaining */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: parseFloat(summary.actual_budget_remaining) >= 0 ? '#4ade80' : '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <PieChart size={16} />
                <span>ACTUAL REMAINING</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: parseFloat(summary.actual_budget_remaining) >= 0 ? '#4ade80' : '#ef4444' }}>
                {formatMoney(summary.actual_budget_remaining)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Budget – Actual
              </div>
            </div>
          </div>

          {/* Category Breakdown Table */}
          {summary.category_breakdowns && summary.category_breakdowns.length > 0 && (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Category Breakdown
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Category</th>
                      <th style={{ padding: '0.5rem' }}>Items</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Estimated Total</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actual Total</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.category_breakdowns.map((cat, idx) => {
                      const est = parseFloat(cat.estimated_total);
                      const act = parseFloat(cat.actual_total);
                      const diff = est - act;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {cat.category}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>
                            {cat.count} {cat.count === 1 ? 'expense' : 'expenses'}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#60a5fa', fontWeight: 600 }}>
                            {formatMoney(cat.estimated_total)}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#c084fc', fontWeight: 600 }}>
                            {formatMoney(cat.actual_total)}
                          </td>
                          <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 600, color: diff >= 0 ? '#34d399' : '#f87171' }}>
                            {diff >= 0 ? `+${formatMoney(diff)}` : formatMoney(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Logged Expenses ({summary.expenses.length})
              </h4>
            </div>

            {summary.expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No expenses logged yet. Click <strong>+ Add Expense</strong> above to begin tracking.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Category</th>
                      <th style={{ padding: '0.5rem' }}>Description</th>
                      <th style={{ padding: '0.5rem' }}>Date</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Estimated</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actual</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Paid</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.expenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {exp.description}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {exp.expense_date || '—'}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#60a5fa', fontWeight: 600 }}>
                          {formatMoney(exp.estimated_amount)}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: '#c084fc', fontWeight: 600 }}>
                          {formatMoney(exp.actual_amount)}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                          {exp.is_paid ? (
                            <CheckCircle2 size={16} style={{ color: '#34d399', margin: '0 auto' }} />
                          ) : (
                            <Circle size={16} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => { setEditingExpense(exp); setIsFormOpen(true); }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Edit Expense"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(exp.id)}
                              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.2rem' }}
                              title="Delete Expense"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingExpense(null); }}
        onSubmit={handleSave}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? Budget totals will recalculate automatically."
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
