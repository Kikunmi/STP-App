import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../hooks/useExpenses';
import { Loading, ExpenseItem, Button, Input, EmptyState } from '../components/ui';

export default function Expenses() {
  const { tripId } = useParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: expenses, isLoading, isError, error } = useExpenses(tripId);
  const createMutation = useCreateExpense(tripId);
  const deleteMutation = useDeleteExpense(tripId);

  const addExpense = async () => {
    if (!title || !amount || !date) return;
    await createMutation.mutateAsync({
      title,
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString(),
    });
    setTitle('');
    setAmount('');
    setCategory('other');
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

      <div className="card-base flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="What did you spend on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Amount"
            type="number"
            min="0"
            step="0.01"
            className="sm:max-w-[10rem]"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="input-base sm:max-w-[12rem]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="transport">Transport</option>
            <option value="accommodation">Accommodation</option>
            <option value="food">Food</option>
            <option value="activity">Activity</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
          <Input
            type="date"
            className="sm:max-w-[12rem]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
          />
          <Button onClick={addExpense} isLoading={createMutation.isPending} className="sm:ml-auto">
            {createMutation.isPending ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
        {createMutation.isError && (
          <div className="text-sm text-[var(--color-danger)]">
            {createMutation.error?.normalizedMessage || 'Failed to add expense'}
          </div>
        )}
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
