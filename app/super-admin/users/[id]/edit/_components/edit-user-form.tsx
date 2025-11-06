

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
import { Loader2, Save, User, Building2, Shield } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  companyId: string | null;
  company?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  email: string;
}

interface EditUserFormProps {
  user: User;
  companies: Company[];
}

export function EditUserForm({ user, companies }: EditUserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    companyId: user.companyId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/super-admin/users/${user.id}`, {
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

      router.push(`/super-admin/users/${user.id}`);
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
      // Si cambia a SUPER_ADMIN, quitar la empresa
      companyId: value === 'SUPER_ADMIN' ? '' : prev.companyId,
    }));
  };

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      companyId: value === 'no-company' ? '' : value,
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked,
    }));
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      COMPANY_ADMIN: 'Administrador de Empresa',
      USER: 'Usuario',
    };
    return roles[role] || role;
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

      {/* Role and Company */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Rol y Permisos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rol del Usuario *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                  <SelectItem value="COMPANY_ADMIN">Administrador de Empresa</SelectItem>
                  <SelectItem value="USER">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleLabel(formData.role)}
              </p>
            </div>

            {formData.role !== 'SUPER_ADMIN' && (
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Select 
                  value={formData.companyId || 'no-company'} 
                  onValueChange={handleCompanyChange} 
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-company">Sin empresa asignada</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role === 'COMPANY_ADMIN' && !formData.companyId && (
                  <p className="text-xs text-red-500 mt-1">
                    Los administradores de empresa deben tener una empresa asignada
                  </p>
                )}
              </div>
            )}
          </div>

          {formData.role === 'SUPER_ADMIN' && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Advertencia:</strong> Los Super Administradores tienen acceso completo 
                al sistema y no pertenecen a ninguna empresa específica.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-green-600" />
            Estado de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* Current Company Info */}
      {user.company && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Empresa Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p><strong>Empresa:</strong> {user.company.name}</p>
              <p><strong>Email:</strong> {user.company.email}</p>
              {formData.companyId !== user.companyId && (
                <p className="text-orange-600 mt-2">
                  <strong>Nota:</strong> Se cambiará la empresa del usuario
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={isLoading || (formData.role === 'COMPANY_ADMIN' && !formData.companyId)}
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
