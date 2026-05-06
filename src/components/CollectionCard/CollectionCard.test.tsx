import { render, screen } from '@testing-library/react';
import CollectionCard from './CollectionCard';
import { Collection } from '@/types';

const mockCollection: Collection = {
  id: 1,
  name: 'Nature',
  created_at: '2023-01-01',
  image_count: 5,
  cover_image: null,
};

describe('CollectionCard', () => {
  it('renders collection name and count', () => {
    render(<CollectionCard collection={mockCollection} />);
    expect(screen.getByText('Nature')).toBeInTheDocument();
    expect(screen.getByText('5 photos')).toBeInTheDocument();
  });
});
