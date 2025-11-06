

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ImpersonatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  firstName: string;
  lastName: string;
  isImpersonating?: boolean;
  originalUserId?: string;
  originalUserEmail?: string;
  originalRole?: string;
  originalFirstName?: string;
  originalLastName?: string;
}

interface ImpersonatedSession {
  user: ImpersonatedUser;
  expires: string;
}

export function useImpersonatedSession() {
  const { data: baseSession, status } = useSession();
  const [impersonatedSession, setImpersonatedSession] = useState<ImpersonatedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpersonatedSession = async () => {
      if (status === 'loading') return;
      
      if (!baseSession?.user) {
        setImpersonatedSession(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/session-with-impersonation');
        if (response.ok) {
          const data = await response.json();
          setImpersonatedSession(data.session);
        } else {
          setImpersonatedSession(baseSession as any);
        }
      } catch (error) {
        console.error('Error fetching impersonated session:', error);
        setImpersonatedSession(baseSession as any);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImpersonatedSession();
  }, [baseSession, status]);

  return {
    data: impersonatedSession,
    status: isLoading ? 'loading' : (impersonatedSession ? 'authenticated' : 'unauthenticated'),
    update: () => {
      // Trigger refetch
      setIsLoading(true);
    }
  };
}
