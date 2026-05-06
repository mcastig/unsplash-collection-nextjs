import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('calls onSubmit when Enter is pressed with a value', () => {
    const onSubmit = jest.fn();
    render(<SearchInput value="nature" onChange={() => {}} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
  });
});
