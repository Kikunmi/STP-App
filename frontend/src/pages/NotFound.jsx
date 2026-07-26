import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 hero-bg">
      <div className="glass card-base max-w-md text-center flex flex-col items-center gap-4 animate-fade-up">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="text-slate-600">The page you are looking for does not exist.</p>
        <Link to="/">
          <Button>Back Home</Button>
        </Link>
      </div>
    </div>
  );
}
