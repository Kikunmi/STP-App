import React, { useState } from 'react';
import {
  useFavorites,
  useCreateFavorite,
  useDeleteFavorite,
} from '../hooks/useFavorites';
import { Loading, FavoriteItem, Button, Input, EmptyState } from '../components/ui';

export default function Favorites() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const { data: favorites, isLoading, isError, error } = useFavorites();
  const createMutation = useCreateFavorite();
  const deleteMutation = useDeleteFavorite();

  const handleAdd = async () => {
    if (!name || !location) return;
    await createMutation.mutateAsync({ name, location });
    setName('');
    setLocation('');
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

      <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button onClick={handleAdd} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {favorites?.length ? (
          favorites.map((fav) => (
            <div key={fav.id || fav._id} className="flex items-center gap-2">
              <div className="flex-1">
                <FavoriteItem fav={fav} />
              </div>
              <Button variant="ghost" onClick={() => deleteMutation.mutate(fav.id || fav._id)}>
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
