
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Save,
  Edit,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SegmentationBuilder from './segmentation-builder';

interface ListEditFormProps {
  listId: string;
  initialData: any;
}

export default function ListEditForm({ listId, initialData }: ListEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    color: initialData?.color || '#3b82f6',
    allowAutoUpdate: initialData?.allowAutoUpdate || false,
    isActive: initialData?.isActive !== false
  });
  
  // Dynamic list specific state
  const [segmentCriteria, setSegmentCriteria] = useState(initialData?.segmentCriteria || null);
  
  // Tags input
  const [tagInput, setTagInput] = useState('');

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove)
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre de la lista es requerido');
      return;
    }

    try {
      setLoading(true);

      const requestData: any = {
        ...formData,
        ...(segmentCriteria && { segmentCriteria })
      };

      const response = await fetch(`/api/dashboard/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando lista');
      }

      toast.success('Lista actualizada exitosamente');
      router.push(`/dashboard/lists/${listId}`);
    } catch (error: any) {
      console.error('Error updating list:', error);
      toast.error(error.message || 'Error actualizando lista');
    } finally {
      setLoading(false);
    }
  };

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5 text-blue-600" />
            Información de la Lista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Lista *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Clientes Premium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Lista</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {initialData?.type === 'STATIC' && 'Estática'}
                  {initialData?.type === 'DYNAMIC' && 'Dinámica'}
                  {initialData?.type === 'IMPORTED' && 'Importada'}
                  {initialData?.type === 'SEGMENT' && 'Segmentada'}
                </Badge>
                <span className="text-sm text-gray-500">(No se puede cambiar)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe el propósito de esta lista..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color de Identificación</Label>
            <div className="flex gap-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-8 h-8 p-0 border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label>Lista activa</Label>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic List Settings */}
      {initialData?.type === 'DYNAMIC' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Lista Dinámica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.allowAutoUpdate}
                onCheckedChange={(checked) => handleInputChange('allowAutoUpdate', checked)}
              />
              <Label>Actualizar automáticamente cuando se agreguen nuevos contactos</Label>
            </div>

            <SegmentationBuilder
              criteria={segmentCriteria}
              onChange={setSegmentCriteria}
            />
          </CardContent>
        </Card>
      )}

      {/* Segment List Settings */}
      {initialData?.type === 'SEGMENT' && initialData?.segmentCriteria && (
        <Card>
          <CardHeader>
            <CardTitle>Criterios de Segmentación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SegmentationBuilder
              criteria={segmentCriteria}
              onChange={setSegmentCriteria}
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/lists/${listId}`)}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>Actualizando...</>
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
