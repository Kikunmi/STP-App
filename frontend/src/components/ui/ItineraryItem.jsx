import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Input from './Input';

const toDateInput = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

export default function ItineraryItem({ item, onUpdate, onDelete, isSaving = false }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title || '');
  const [activityDate, setActivityDate] = useState(toDateInput(item.activityDate));
  const [time, setTime] = useState(item.time || '');

  const canEdit = typeof onUpdate === 'function';

  const dateLabel = item.activityDate
    ? new Date(item.activityDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;
  const badge = [dateLabel, item.time].filter(Boolean).join(' · ');

  const handleSave = async () => {
    if (!title || !activityDate || !time) return;
    await onUpdate({
      title,
      activityDate: new Date(activityDate).toISOString(),
      time,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(item.title || '');
    setActivityDate(toDateInput(item.activityDate));
    setTime(item.time || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card-base py-4 flex flex-col gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="date"
            className="sm:max-w-[12rem]"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            aria-label="Activity date"
          />
          <Input
            type="time"
            className="sm:max-w-[8rem]"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
          <div className="flex gap-2 sm:ml-auto">
            <Button size="sm" onClick={handleSave} isLoading={isSaving}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base card-hover py-4 flex gap-4 items-start">
      <div className="flex flex-col items-center pt-1">
        <span className="h-3 w-3 rounded-full bg-brand-gradient shadow-glow" />
        <span className="w-px flex-1 bg-slate-200 mt-1" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-slate-900">{item.title}</h4>
          {badge && <span className="badge bg-brand-50 text-brand-600 shrink-0">{badge}</span>}
        </div>
        {(item.description || item.notes) && (
          <p className="text-sm text-slate-500 mt-1">{item.description || item.notes}</p>
        )}
        {item.location && <p className="text-xs text-slate-400 mt-1">📍 {item.location}</p>}
      </div>
      {(canEdit || typeof onDelete === 'function') && (
        <div className="flex gap-1 shrink-0">
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          {typeof onDelete === 'function' && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

ItineraryItem.propTypes = {
  item: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  isSaving: PropTypes.bool,
};
