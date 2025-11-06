

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Building2, MapPin } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  credits: number;
  createdAt: Date;
}

interface EditCompanyFormProps {
  company: Company;
}

export function EditCompanyForm({ company }: EditCompanyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    email: company.email,
    phone: company.phone || '',
    website: company.website || '',
    address: company.address || '',
    city: company.city || '',
    state: company.state || '',
    country: company.country || '',
    zipCode: company.zipCode || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/super-admin/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la empresa');
      }

      toast({
        title: '¡Empresa actualizada exitosamente!',
        description: 'Los cambios se han guardado correctamente',
      });

      router.push(`/super-admin/companies/${company.id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar la empresa',
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
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre de la Empresa *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Nombre de la empresa"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email de la Empresa *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="contacto@empresa.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+52-55-1234-5678"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://empresa.com"
                value={formData.website}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-green-600" />
            Información de Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Calle, número, colonia"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Ciudad de México"
                value={formData.city}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="state">Estado/Región</Label>
              <Input
                id="state"
                name="state"
                type="text"
                placeholder="CDMX"
                value={formData.state}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                name="country"
                type="text"
                placeholder="México"
                value={formData.country}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                placeholder="01000"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Status */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Créditos Actuales</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <span className="font-medium">{company.credits.toLocaleString()}</span>
                <span className="text-sm text-gray-500 ml-2">créditos disponibles</span>
              </div>
            </div>
            <div>
              <Label>Fecha de Registro</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                <span className="text-sm">
                  {company.createdAt.toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Para modificar créditos o configuraciones avanzadas, usa las opciones específicas desde los detalles de la empresa.
          </p>
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
