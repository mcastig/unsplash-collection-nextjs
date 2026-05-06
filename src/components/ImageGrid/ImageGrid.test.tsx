import { render } from '@testing-library/react';
import ImageGrid from './ImageGrid';

describe('ImageGrid', () => {
  it('renders without crashing with empty images', () => {
    const { container } = render(<ImageGrid images={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
