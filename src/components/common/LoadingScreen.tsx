import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 text-accent-600 animate-spin" />
        <p className="text-lg font-medium text-primary-700">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;