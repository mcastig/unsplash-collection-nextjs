import { render, screen } from '@testing-library/react';
import ImageGrid from './ImageGrid';
import { UnsplashImage } from '@/types';

const makeImg = (id: string): UnsplashImage => ({
  id, created_at: '2024-01-01', width: 400, height: 300,
  description: null, alt_description: `photo ${id}`,
  urls: { raw: '', full: '', regular: '', small: `/img/${id}.jpg`, thumb: '' },
  links: { html: '', download: '', download_location: '' },
  user: { id: 'u1', name: 'Author', username: 'author', profile_image: { small: '', medium: '', large: '' }, links: { html: '' } },
});

describe('ImageGrid', () => {
  it('renders nothing when images array is empty', () => {
    const { container } = render(<ImageGrid images={[]} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('renders correct number of image cards', () => {
    render(<ImageGrid images={[makeImg('1'), makeImg('2'), makeImg('3')]} />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('renders each image with correct href', () => {
    render(<ImageGrid images={[makeImg('x1'), makeImg('x2')]} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/images/x1');
    expect(links[1]).toHaveAttribute('href', '/images/x2');
  });
});
