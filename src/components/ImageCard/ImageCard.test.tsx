import { render, screen } from '@testing-library/react';
import ImageCard from './ImageCard';
import { UnsplashImage } from '@/types';

const mockImage: UnsplashImage = {
  id: 'abc123',
  created_at: '2023-01-01',
  width: 800,
  height: 600,
  description: null,
  alt_description: 'test photo',
  urls: { raw: '', full: '', regular: '', small: '/test.jpg', thumb: '' },
  links: { html: '', download: '', download_location: '' },
  user: { id: 'u1', name: 'Test User', username: 'testuser', profile_image: { small: '', medium: '', large: '' }, links: { html: '' } },
};

describe('ImageCard', () => {
  it('renders a link to the image page', () => {
    render(<ImageCard image={mockImage} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/images/abc123');
  });
});
