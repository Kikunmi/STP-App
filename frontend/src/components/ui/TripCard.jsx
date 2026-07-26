import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const formatDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
};

export default function TripCard({ trip }) {
  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);

  return (
    <Card hover className="flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="11" r="2.5" strokeWidth={2} />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{trip.title}</h3>
            <p className="text-sm text-slate-500 truncate">{trip.destination}</p>
          </div>
        </div>
      </div>

      {(start || end) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{start}{end ? ` – ${end}` : ''}</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="badge bg-brand-50 text-brand-600">View trip</span>
        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
}

TripCard.propTypes = {
  trip: PropTypes.object.isRequired,
};
