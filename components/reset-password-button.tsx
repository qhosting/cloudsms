

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ResetPasswordButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  disabled?: boolean;
  variant?: 'default' | 'full-width';
}

export function ResetPasswordButton({ 
  userId, 
  userName, 
  userEmail, 
  userRole,
  disabled = false,
  variant = 'default'
}: ResetPasswordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una contraseña segura automáticamente',
    });
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: 'Error',
        description: 'La contraseña no puede estar vacía',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/super-admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '¡Contraseña actualizada exitosamente!',
          description: `La contraseña de ${userName} ha sido cambiada`,
        });

        setIsDialogOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        router.refresh();
      } else {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error: any) {
      toast({
        title: 'Error al cambiar contraseña',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Don't show for super admins or disabled users
  if (userRole === 'SUPER_ADMIN' || disabled) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {variant === 'full-width' ? (
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Key className="mr-2 h-4 w-4" />
            Cambiar Contraseña
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Key className="h-4 w-4 mr-1" />
            Cambiar Contraseña
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Cambiar Contraseña de Usuario
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Vas a cambiar la contraseña de <strong>{userName}</strong> ({userEmail}).
            </p>
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              <strong>Advertencia:</strong> Esta acción cambiará la contraseña del usuario 
              inmediatamente. El usuario deberá usar la nueva contraseña para su próximo 
              inicio de sesión.
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar nueva contraseña..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={generateRandomPassword}
            disabled={isLoading}
            className="w-full"
          >
            <Key className="mr-2 h-4 w-4" />
            Generar Contraseña Segura
          </Button>

          {newPassword && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Longitud:</strong> {newPassword.length} caracteres
              {newPassword !== confirmPassword && (
                <div className="text-red-500 mt-1">
                  ⚠️ Las contraseñas no coinciden
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isLoading || !newPassword || newPassword !== confirmPassword}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
