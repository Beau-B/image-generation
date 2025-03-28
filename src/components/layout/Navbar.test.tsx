import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    userData: null,
  }),
}));

describe('Navbar', () => {
  it('renders login and signup buttons when user is not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders logo and brand name', () => {
    render(<Navbar />);
    
    expect(screen.getByText('ImagenAI')).toBeInTheDocument();
  });

  it('includes pricing link in navigation', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});