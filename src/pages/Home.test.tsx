import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import Home from './Home';

describe('Home', () => {
  it('renders hero section with main heading', () => {
    render(<Home />);
    
    expect(screen.getByText(/Transform Your Ideas Into/i)).toBeInTheDocument();
    expect(screen.getByText(/Stunning Visuals/i)).toBeInTheDocument();
  });

  it('displays call-to-action buttons', () => {
    render(<Home />);
    
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText(/View Pricing/i)).toBeInTheDocument();
  });

  it('shows features section', () => {
    render(<Home />);
    
    expect(screen.getByText('Style-Based Generation')).toBeInTheDocument();
    expect(screen.getByText('Smart Image Editing')).toBeInTheDocument();
    expect(screen.getByText('Enterprise-Ready')).toBeInTheDocument();
  });
});