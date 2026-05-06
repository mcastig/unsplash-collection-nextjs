import { render, screen, fireEvent } from '@testing-library/react';
import NewCollectionModal from './NewCollectionModal';

describe('NewCollectionModal', () => {
  it('calls onSave with input value', () => {
    const onSave = jest.fn();
    render(<NewCollectionModal onSave={onSave} onCancel={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Collection name'), { target: { value: 'My Collection' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('My Collection');
  });
});
