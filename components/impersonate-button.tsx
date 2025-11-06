

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ImpersonateButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  disabled?: boolean;
}

export function ImpersonateButton({ 
  userId, 
  userName, 
  userEmail, 
  userRole, 
  disabled = false 
}: ImpersonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/super-admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '¡Impersonación iniciada!',
          description: `Ahora estás viendo el sistema como ${userName}`,
        });

        setIsDialogOpen(false);
        
        // Force a full page reload to update the session with impersonation data
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.error || 'Error al iniciar impersonación');
      }
    } catch (error: any) {
      toast({
        title: 'Error al iniciar impersonación',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole === 'SUPER_ADMIN' || disabled) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400">
          <UserCheck className="h-4 w-4 mr-1" />
          Login as
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Confirmar Impersonación
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Estás a punto de iniciar sesión como <strong>{userName}</strong> ({userEmail}).
            </p>
            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              <strong>Advertencia:</strong> Durante la impersonación, tendrás acceso completo 
              a la cuenta del usuario y podrás realizar acciones en su nombre. Usa esta 
              funcionalidad responsablemente y solo para propósitos administrativos.
            </p>
            <p className="text-xs text-gray-500">
              La sesión de impersonación será registrada en los logs del sistema.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImpersonate}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Iniciar Impersonación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
