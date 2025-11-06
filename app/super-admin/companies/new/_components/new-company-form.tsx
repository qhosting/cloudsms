

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, User } from 'lucide-react';

export function NewCompanyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Company data
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    initialCredits: '100',
    
    // Admin user data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/super-admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la empresa');
      }

      toast({
        title: '¡Empresa creada exitosamente!',
        description: 'La empresa y su administrador han sido creados',
      });

      router.push(`/super-admin/companies/${data.companyId}`);
    } catch (error: any) {
      toast({
        title: 'Error al crear la empresa',
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nombre de la Empresa *</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                required
                placeholder="Acme Corporation"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="companyEmail">Email de la Empresa *</Label>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                required
                placeholder="contacto@empresa.com"
                value={formData.companyEmail}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="companyPhone">Teléfono</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                type="tel"
                placeholder="+52-55-1234-5678"
                value={formData.companyPhone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="companyWebsite">Sitio Web</Label>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                placeholder="https://empresa.com"
                value={formData.companyWebsite}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="initialCredits">Créditos Iniciales</Label>
              <Input
                id="initialCredits"
                name="initialCredits"
                type="number"
                min="0"
                placeholder="100"
                value={formData.initialCredits}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Administrator Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-green-600" />
            Administrador Principal
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
                onChange={handleChange}
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
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@empresa.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Cargo</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="Director General"
                value={formData.jobTitle}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="password">Contraseña Temporal *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                El usuario deberá cambiar esta contraseña en su primer inicio de sesión
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              Creando...
            </>
          ) : (
            'Crear Empresa'
          )}
        </Button>
      </div>
    </form>
  );
}
