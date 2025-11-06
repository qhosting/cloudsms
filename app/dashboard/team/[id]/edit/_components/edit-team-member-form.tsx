

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
import { Loader2, Save, User, Shield } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface EditTeamMemberFormProps {
  user: User;
}

export function EditTeamMemberForm({ user }: EditTeamMemberFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/dashboard/team/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el usuario');
      }

      toast({
        title: '¡Usuario actualizado exitosamente!',
        description: 'Los cambios se han guardado correctamente',
      });

      router.push(`/dashboard/team/${user.id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar el usuario',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-600" />
            Información Personal
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="usuario@empresa.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role and Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Rol y Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                ? 'Tendrá acceso administrativo completo a la empresa'
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
                Usuario Activo
              </Label>
              <p className="text-xs text-gray-500">
                {formData.isActive 
                  ? 'El usuario puede iniciar sesión y usar el sistema'
                  : 'El usuario no puede iniciar sesión'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Information */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Información Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Usuario:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email actual:</strong> {user.email}</p>
            <p><strong>Rol actual:</strong> {user.role === 'COMPANY_ADMIN' ? 'Administrador' : 'Usuario'}</p>
            <p><strong>Estado actual:</strong> {user.isActive ? 'Activo' : 'Inactivo'}</p>
            
            {(formData.email !== user.email || formData.role !== user.role) && (
              <div className="mt-3 p-2 bg-orange-100 rounded text-orange-700">
                <strong>Cambios pendientes:</strong>
                {formData.email !== user.email && <p>• Email será actualizado</p>}
                {formData.role !== user.role && <p>• Rol será cambiado a {formData.role === 'COMPANY_ADMIN' ? 'Administrador' : 'Usuario'}</p>}
              </div>
            )}
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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
