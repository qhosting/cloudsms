

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, User, Shield } from 'lucide-react';

interface InviteUserFormProps {
  companyId: string;
}

export function InviteUserForm({ companyId }: InviteUserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/dashboard/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al invitar el usuario');
      }

      toast({
        title: '¡Usuario invitado exitosamente!',
        description: `${formData.firstName} ${formData.lastName} ha sido agregado a tu equipo`,
      });

      router.push('/dashboard/team');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error al invitar usuario',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked,
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una contraseña temporal',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-600" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">Email Corporativo *</Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este será el email para iniciar sesión
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Configuración de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña Temporal *</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                name="password"
                type="text"
                required
                placeholder="Contraseña temporal..."
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomPassword}
                disabled={isLoading}
              >
                Generar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El usuario deberá cambiar esta contraseña en su primer acceso
            </p>
          </div>

          <div>
            <Label htmlFor="role">Rol en la Empresa *</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="COMPANY_ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'COMPANY_ADMIN' 
                ? 'Podrá gestionar usuarios y configuraciones de la empresa'
                : 'Acceso básico para crear campañas y gestionar contactos'
              }
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleActiveChange}
              disabled={isLoading}
            />
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">
                Activar Inmediatamente
              </Label>
              <p className="text-xs text-gray-500">
                {formData.isActive 
                  ? 'El usuario podrá iniciar sesión inmediatamente'
                  : 'El usuario será creado pero no podrá acceder hasta ser activado'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Note */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900">
                Notificación por Email
              </h4>
              <p className="text-blue-700 mt-1">
                En el futuro, se enviará automáticamente un email de bienvenida 
                al nuevo usuario con sus credenciales de acceso e instrucciones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.password}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invitando...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar Usuario
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
