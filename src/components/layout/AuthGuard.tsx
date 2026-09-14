import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGuard = ({ requireAdmin = false }: { requireAdmin?: boolean }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return <Outlet />;
};

