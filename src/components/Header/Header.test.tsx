import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders logo and navigation links', () => {
    render(<Header />);
    expect(screen.getByText('UnsplashBox')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
  });
});
