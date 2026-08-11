import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { FileSignature, Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mx-auto mb-6">
          <FileSignature className="w-8 h-8 text-sky-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-200 dark:text-slate-800 mb-4">404</h1>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h2>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to= "/">
          <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}