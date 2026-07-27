import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTripShares, useShareTrip, useUnshareTrip } from '../hooks/useSharing';
import { Button, Input, Card, Loading, EmptyState } from '../components/ui';

export default function ShareTrip() {
  const { tripId } = useParams();
  const [identifier, setIdentifier] = useState('');

  const { data: shares, isLoading } = useTripShares(tripId);
  const shareMutation = useShareTrip(tripId);
  const unshareMutation = useUnshareTrip(tripId);

  const handleShare = async () => {
    if (!identifier.trim()) return;
    await shareMutation.mutateAsync({ identifier: identifier.trim() });
    setIdentifier('');
  };

  return (
    <section className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Share Trip</h1>
        <p className="text-slate-500">Invite people by their email or username.</p>
      </div>

      <div className="card-base flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button onClick={handleShare} isLoading={shareMutation.isPending}>
            {shareMutation.isPending ? 'Sharing...' : 'Share'}
          </Button>
        </div>
        {shareMutation.isError && (
          <div className="text-sm text-[var(--color-danger)]">
            {shareMutation.error?.normalizedMessage || 'Failed to share trip'}
          </div>
        )}
        {shareMutation.isSuccess && (
          <div className="text-sm text-[var(--color-success)]">Trip shared successfully.</div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Shared with</h2>
        {isLoading ? (
          <Loading message="Loading shares..." />
        ) : shares?.length ? (
          shares.map((share) => {
            const user = share.sharedUser || {};
            const userId = user._id || user.id;
            return (
              <Card key={share._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.username || 'User'}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unshareMutation.mutate(userId)}
                >
                  Revoke
                </Button>
              </Card>
            );
          })
        ) : (
          <EmptyState title="Not shared yet" subtitle="Share this trip with a friend above." />
        )}
      </div>
    </section>
  );
}
