import React from 'react';
import PropTypes from 'prop-types';

export default function FavoriteItem({ fav }) {
  return (
    <div className="card-base card-hover py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[var(--color-danger)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-slate-900">{fav.name}</div>
          <div className="text-sm text-slate-500">{fav.location}</div>
        </div>
      </div>
      {fav.type && <span className="badge bg-slate-100 text-slate-500">{fav.type}</span>}
    </div>
  );
}

FavoriteItem.propTypes = {
  fav: PropTypes.object.isRequired,
};
