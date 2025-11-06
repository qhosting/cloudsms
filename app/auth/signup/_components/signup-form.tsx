
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Mail, Lock, User, Phone, Globe } from 'lucide-react';

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Company data
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    
    // User data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error de validación',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          companyWebsite: formData.companyWebsite,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          jobTitle: formData.jobTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      toast({
        title: '¡Cuenta creada exitosamente!',
        description: 'Ya puedes iniciar sesión con tu nueva cuenta',
      });

      router.push('/auth/signin');
    } catch (error: any) {
      toast({
        title: 'Error al crear la cuenta',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-emerald-600" />
          Información de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="pl-10"
                placeholder="Mi Empresa"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyEmail">Email de la Empresa *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                required
                className="pl-10"
                placeholder="contacto@miempresa.com"
                value={formData.companyEmail}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyPhone">Teléfono</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="companyPhone"
                name="companyPhone"
                type="tel"
                className="pl-10"
                placeholder="+52-55-1234-5678"
                value={formData.companyPhone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyWebsite">Sitio Web</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                className="pl-10"
                placeholder="https://miempresa.com"
                value={formData.companyWebsite}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Administrator Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-600" />
          Información del Administrador
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="pl-10"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lastName">Apellido *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="pl-10"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Personal *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10"
                placeholder="juan@miempresa.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="jobTitle">Cargo</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                className="pl-10"
                placeholder="Director de Marketing"
                value={formData.jobTitle}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Contraseña *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="pl-10"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear Cuenta'
        )}
      </Button>
    </form>
  );
}
