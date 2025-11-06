
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Save, 
  Eye, 
  Wand2, 
  List,
  Upload,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SegmentationBuilder from './segmentation-builder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContactList {
  id: string;
  name: string;
  totalContacts: number;
}

export default function ListCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableLists, setAvailableLists] = useState<ContactList[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'STATIC',
    tags: [] as string[],
    color: '#3b82f6',
    allowAutoUpdate: false
  });
  
  // Dynamic/Segment specific state
  const [segmentCriteria, setSegmentCriteria] = useState<any>(null);
  const [sourceListIds, setSourceListIds] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Tags input
  const [tagInput, setTagInput] = useState('');
  
  // Current tab
  const [currentTab, setCurrentTab] = useState('basic');

  // Fetch available lists for segmentation
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/dashboard/lists?limit=100');
        if (response.ok) {
          const data = await response.json();
          setAvailableLists(data.lists || []);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, []);

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
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Preview segmentation
  const handlePreview = async () => {
    if (formData.type !== 'DYNAMIC' && formData.type !== 'SEGMENT') {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/lists/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: segmentCriteria,
          sourceListIds: formData.type === 'SEGMENT' ? sourceListIds : [],
          previewOnly: true
        })
      });

      if (!response.ok) {
        throw new Error('Error generating preview');
      }

      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing:', error);
      toast.error('Error generando vista previa');
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre de la lista es requerido');
      return;
    }

    if ((formData.type === 'DYNAMIC' || formData.type === 'SEGMENT') && !segmentCriteria) {
      toast.error('Los criterios de segmentación son requeridos');
      return;
    }

    if (formData.type === 'SEGMENT' && sourceListIds.length === 0) {
      toast.error('Selecciona al menos una lista fuente para la segmentación');
      return;
    }

    try {
      setLoading(true);

      const requestData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        tags: formData.tags,
        color: formData.color,
        allowAutoUpdate: formData.allowAutoUpdate,
        ...(segmentCriteria && { segmentCriteria }),
        ...(sourceListIds.length > 0 && { sourceListIds })
      };

      const response = await fetch('/api/dashboard/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando lista');
      }

      const newList = await response.json();
      toast.success('Lista creada exitosamente');
      router.push(`/dashboard/lists/${newList.id}`);
    } catch (error: any) {
      console.error('Error creating list:', error);
      toast.error(error.message || 'Error creando lista');
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
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="setup">Configuración</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="mr-2 h-5 w-5 text-blue-600" />
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
                  <Label htmlFor="type">Tipo de Lista</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATIC">Estática - Lista manual</SelectItem>
                      <SelectItem value="DYNAMIC">Dinámica - Se actualiza automáticamente</SelectItem>
                      <SelectItem value="SEGMENT">Segmentada - Basada en otros listas</SelectItem>
                      <SelectItem value="IMPORTED">Importada - Desde archivo</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {formData.type === 'DYNAMIC' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2 h-5 w-5 text-green-600" />
                  Configuración de Lista Dinámica
                </CardTitle>
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

          {formData.type === 'SEGMENT' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-orange-600" />
                  Configuración de Segmentación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Listas Fuente</Label>
                  <Select 
                    value=""
                    onValueChange={(listId) => {
                      if (!sourceListIds.includes(listId)) {
                        setSourceListIds(prev => [...prev, listId]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar listas..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLists
                        .filter(list => !sourceListIds.includes(list.id))
                        .map(list => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name} ({list.totalContacts} contactos)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {sourceListIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sourceListIds.map(listId => {
                        const list = availableLists.find(l => l.id === listId);
                        return list ? (
                          <Badge key={listId} variant="outline" className="flex items-center gap-1">
                            {list.name}
                            <button
                              type="button"
                              onClick={() => setSourceListIds(prev => prev.filter(id => id !== listId))}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <SegmentationBuilder
                  criteria={segmentCriteria}
                  onChange={setSegmentCriteria}
                />
              </CardContent>
            </Card>
          )}

          {formData.type === 'IMPORTED' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-purple-600" />
                  Importación de Archivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">
                    La funcionalidad de importación se configurará después de crear la lista
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-600" />
                  Vista Previa
                </div>
                {(formData.type === 'DYNAMIC' || formData.type === 'SEGMENT') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={loading}
                  >
                    {loading ? 'Generando...' : 'Generar Vista Previa'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Nombre:</p>
                    <p className="font-medium">{formData.name || 'Sin nombre'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo:</p>
                    <p className="font-medium">
                      {formData.type === 'STATIC' && 'Estática'}
                      {formData.type === 'DYNAMIC' && 'Dinámica'}
                      {formData.type === 'SEGMENT' && 'Segmentada'}
                      {formData.type === 'IMPORTED' && 'Importada'}
                    </p>
                  </div>
                </div>

                {previewData && showPreview && (
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {previewData.totalMatching}
                        </div>
                        <div className="text-sm text-gray-600">Contactos que coinciden</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          {previewData.totalBase}
                        </div>
                        <div className="text-sm text-gray-600">Total evaluados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {previewData.matchPercentage}%
                        </div>
                        <div className="text-sm text-gray-600">Coincidencia</div>
                      </div>
                    </div>

                    {previewData.preview && previewData.preview.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Muestra de contactos:</h4>
                        <div className="space-y-2">
                          {previewData.preview.map((contact: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </span>
                                <span className="text-gray-600 ml-2">{contact.phone}</span>
                              </div>
                              {contact.company && (
                                <span className="text-sm text-gray-500">{contact.company}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/lists')}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>Creando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Crear Lista
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
