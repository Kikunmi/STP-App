import React from 'react';
import PropTypes from 'prop-types';

export default function ItineraryItem({ item }) {
  return (
    <div className="card-base card-hover py-4 flex gap-4 items-start">
      <div className="flex flex-col items-center pt-1">
        <span className="h-3 w-3 rounded-full bg-brand-gradient shadow-glow" />
        <span className="w-px flex-1 bg-slate-200 mt-1" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-slate-900">{item.title}</h4>
          {item.time && (
            <span className="badge bg-brand-50 text-brand-600 shrink-0">{item.time}</span>
          )}
        </div>
        {item.notes && <p className="text-sm text-slate-500 mt-1">{item.notes}</p>}
      </div>
    </div>
  );
}

ItineraryItem.propTypes = {
  item: PropTypes.object.isRequired,
};
