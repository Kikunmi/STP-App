import React, { useState } from 'react';
import {
  useFavorites,
  useCreateFavorite,
  useDeleteFavorite,
} from '../hooks/useFavorites';
import { Loading, FavoriteItem, Button, Input, EmptyState } from '../components/ui';

export default function Favorites() {
  const [destinationName, setDestinationName] = useState('');
  const [country, setCountry] = useState('');

  const { data: favorites, isLoading, isError, error } = useFavorites();
  const createMutation = useCreateFavorite();
  const deleteMutation = useDeleteFavorite();

  const handleAdd = async () => {
    if (!destinationName || !country) return;
    await createMutation.mutateAsync({ destinationName, country });
    setDestinationName('');
    setCountry('');
  };

  if (isLoading) return <Loading message="Loading favorites..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load favorites'}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Favorite Destinations</h1>

      <div className="card-base flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Destination (e.g. Santorini)"
          value={destinationName}
          onChange={(e) => setDestinationName(e.target.value)}
        />
        <Input
          placeholder="Country (e.g. Greece)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <Button onClick={handleAdd} isLoading={createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {createMutation.isError && (
        <div className="text-sm text-[var(--color-danger)]">
          {createMutation.error?.normalizedMessage || 'Failed to add favorite'}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {favorites?.length ? (
          favorites.map((fav) => (
            <div key={fav.id || fav._id} className="flex items-center gap-2">
              <div className="flex-1">
                <FavoriteItem fav={fav} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(fav.id || fav._id)}
              >
                Remove
              </Button>
            </div>
          ))
        ) : (
          <EmptyState title="No favorites yet" subtitle="Save destinations you love." />
        )}
      </div>
    </section>
  );
}
