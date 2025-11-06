

'use client';

import { useImpersonatedSession } from '@/hooks/use-impersonated-session';

interface ImpersonationLayoutWrapperProps {
  children: React.ReactNode;
}

export function ImpersonationLayoutWrapper({ children }: ImpersonationLayoutWrapperProps) {
  const { data: session, status } = useImpersonatedSession();
  
  // Check if currently impersonating
  const isImpersonating = session?.user?.isImpersonating || false;
  
  return (
    <div className={`min-h-screen ${isImpersonating ? 'pt-16' : ''}`}>
      {children}
    </div>
  );
}
