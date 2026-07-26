import React from 'react';
import PropTypes from 'prop-types';

export default function ExpenseItem({ expense }) {
  return (
    <div className="card-base card-hover py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m10-6h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-2" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-slate-900">{expense.title}</div>
          {expense.category && (
            <span className="badge bg-slate-100 text-slate-500 mt-0.5">{expense.category}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-slate-900">${Number(expense.amount).toFixed(2)}</div>
        {expense.date && (
          <div className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}

ExpenseItem.propTypes = {
  expense: PropTypes.object.isRequired,
};
