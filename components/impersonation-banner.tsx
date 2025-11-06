

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, X, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useImpersonatedSession } from '@/hooks/use-impersonated-session';

interface ImpersonationData {
  originalUserEmail: string;
  targetUserEmail: string;
  targetUserId: string;
  startedAt: string;
}

export function ImpersonationBanner() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useImpersonatedSession();
  const { toast } = useToast();
  const router = useRouter();

  // Check if currently impersonating based on session
  const isImpersonating = session?.user?.isImpersonating || false;

  const endImpersonation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/super-admin/impersonate', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Impersonación finalizada',
          description: 'Has regresado a tu sesión original de Super Admin',
        });
        
        // Force a full page reload to update the session
        window.location.href = '/super-admin';
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al finalizar impersonación');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isImpersonating || status === 'loading') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg">
      <Alert className="rounded-none border-0 bg-orange-500 text-white">
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="font-medium">
              Impersonando a: {session?.user?.firstName} {session?.user?.lastName} ({session?.user?.email})
            </span>
            <span className="text-orange-200 text-sm">
              | Admin original: {session?.user?.originalFirstName} {session?.user?.originalLastName} ({session?.user?.originalUserEmail})
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={endImpersonation}
            disabled={isLoading}
            className="text-white hover:bg-orange-600 h-8 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Finalizar Impersonación
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
