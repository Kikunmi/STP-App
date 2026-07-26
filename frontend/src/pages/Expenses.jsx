import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../hooks/useExpenses';
import { Loading, ExpenseItem, Button, Input, EmptyState } from '../components/ui';

export default function Expenses() {
  const { tripId } = useParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const { data: expenses, isLoading, isError, error } = useExpenses(tripId);
  const createMutation = useCreateExpense(tripId);
  const deleteMutation = useDeleteExpense(tripId);

  const addExpense = async () => {
    if (!title || !amount) return;
    await createMutation.mutateAsync({ title, amount: parseFloat(amount) });
    setTitle('');
    setAmount('');
  };

  if (isLoading) return <Loading message="Loading expenses..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load expenses'}
      </div>
    );
  }

  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex items-center gap-3 rounded-2xl bg-brand-gradient px-5 py-3 text-white shadow-glow">
          <span className="text-sm/none opacity-90">Total spent</span>
          <span className="text-xl font-extrabold">${total.toFixed(2)}</span>
        </div>
      </header>

      <div className="card-base flex flex-col sm:flex-row gap-3">
        <Input placeholder="What did you spend on?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          placeholder="Amount"
          type="number"
          className="sm:max-w-[10rem]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button onClick={addExpense} isLoading={createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add Expense'}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {expenses?.length ? (
          expenses.map((expense) => (
            <div key={expense.id || expense._id} className="flex items-center gap-2">
              <div className="flex-1">
                <ExpenseItem expense={expense} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(expense.id || expense._id)}
              >
                Delete
              </Button>
            </div>
          ))
        ) : (
          <EmptyState title="No expenses yet" subtitle="Track your first expense above." />
        )}
      </div>
    </section>
  );
}
