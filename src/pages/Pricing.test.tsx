import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import Pricing from './Pricing';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('../context/UserContext', () => ({
  useUser: () => ({
    subscription: null,
  }),
}));

describe('Pricing', () => {
  it('renders pricing tiers', () => {
    render(<Pricing />);
    
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('shows features for each tier', () => {
    render(<Pricing />);
    
    expect(screen.getByText(/10 image generations per month/i)).toBeInTheDocument();
    expect(screen.getByText(/100 image generations per month/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited image generations/i)).toBeInTheDocument();
  });

  it('displays pricing information', () => {
    render(<Pricing />);
    
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});