import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../ui/Button';

describe('Button', () => {
  test('renders children and responds to click', async () => {
    const handle = vi.fn();
    render(<Button onClick={handle}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(btn);
    expect(handle).toHaveBeenCalled();
  });
});
