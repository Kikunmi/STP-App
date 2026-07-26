import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateShareLink } from '../hooks/useSharing';
import { Button, Input, Card } from '../components/ui';

export default function ShareTrip() {
  const { tripId } = useParams();
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const mutation = useCreateShareLink();

  const handleCreate = async () => {
    const data = await mutation.mutateAsync(tripId);
    const shareId = data?.shareId || data?.id;
    setLink(`${window.location.origin}/share/${shareId}`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="max-w-lg flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Share Trip</h1>

      <Button onClick={handleCreate} disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Share Link'}
      </Button>

      {mutation.isError && (
        <div className="text-sm text-[var(--color-danger)]">
          {mutation.error?.normalizedMessage || 'Failed to create share link'}
        </div>
      )}

      {link && (
        <Card className="flex flex-col gap-2">
          <Input value={link} readOnly />
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </Card>
      )}
    </section>
  );
}
