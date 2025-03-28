import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';

const AllTheProviders = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };