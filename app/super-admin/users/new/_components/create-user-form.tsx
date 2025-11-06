

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
import { Loader2, UserPlus, User, Shield, Lock } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface CreateUserFormProps {
  companies: Company[];
}

export function CreateUserForm({ companies }: CreateUserFormProps) {
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
    companyId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el usuario');
      }

      toast({
        title: '¡Usuario creado exitosamente!',
        description: `El usuario ${formData.firstName} ${formData.lastName} ha sido creado`,
      });

      router.push(`/super-admin/users/${data.user.id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error al crear el usuario',
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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una contraseña segura aleatoria',
    });
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      SUPER_ADMIN: 'Acceso completo al sistema, gestión de todas las empresas',
      COMPANY_ADMIN: 'Administrador de empresa, gestión de usuarios y campañas de su empresa',
      USER: 'Usuario básico, creación y gestión de sus propias campañas',
    };
    return descriptions[role] || '';
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
              <p className="text-xs text-gray-500 mt-1">
                El email será utilizado para iniciar sesión
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-red-600" />
            Autenticación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña *</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                name="password"
                type="text"
                required
                placeholder="Contraseña segura..."
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
              Mínimo 8 caracteres. El usuario podrá cambiarla después.
            </p>
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
                  <SelectItem value="USER">Usuario</SelectItem>
                  <SelectItem value="COMPANY_ADMIN">Administrador de Empresa</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleDescription(formData.role)}
              </p>
            </div>

            {formData.role !== 'SUPER_ADMIN' && (
              <div>
                <Label htmlFor="company">Empresa {formData.role === 'COMPANY_ADMIN' ? '*' : ''}</Label>
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
                al sistema y pueden gestionar todas las empresas y usuarios.
              </p>
            </div>
          )}

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
                  ? 'El usuario podrá iniciar sesión inmediatamente'
                  : 'El usuario será creado pero no podrá iniciar sesión hasta ser activado'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">Resumen del Nuevo Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Nombre:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Rol:</strong> {getRoleDescription(formData.role).split(',')[0]}</p>
            {formData.companyId && (
              <p><strong>Empresa:</strong> {companies.find(c => c.id === formData.companyId)?.name}</p>
            )}
            <p><strong>Estado:</strong> {formData.isActive ? 'Activo' : 'Inactivo'}</p>
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
          className="bg-green-600 hover:bg-green-700"
          disabled={
            isLoading || 
            !formData.firstName || 
            !formData.lastName || 
            !formData.email || 
            !formData.password ||
            (formData.role === 'COMPANY_ADMIN' && !formData.companyId)
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Usuario...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Usuario
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
