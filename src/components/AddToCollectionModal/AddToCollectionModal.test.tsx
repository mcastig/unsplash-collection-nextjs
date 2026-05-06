import { render, screen } from '@testing-library/react';
import AddToCollectionModal from './AddToCollectionModal';

const collections = [
  { id: 1, name: 'Nature', created_at: '2023-01-01', image_count: 3, cover_image: null },
  { id: 2, name: 'Urban', created_at: '2023-01-02', image_count: 1, cover_image: null },
];

describe('AddToCollectionModal', () => {
  it('filters out already added collections', () => {
    render(
      <AddToCollectionModal
        collections={collections}
        alreadyInCollectionIds={[1]}
        onAdd={() => {}}
        onCreateNew={() => {}}
        onClose={() => {}}
      />
    );
    expect(screen.queryByText('Nature')).not.toBeInTheDocument();
    expect(screen.getByText('Urban')).toBeInTheDocument();
  });
});
