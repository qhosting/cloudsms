

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
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Calendar,
  Eye,
  Save,
  Loader2,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  type: string;
  targetType: string;
  totalRecipients: number;
  estimatedCost: number;
  scheduledAt: string | null;
  timezone: string;
  contactList: {
    id: string;
    name: string;
    totalContacts: number;
    validContacts: number;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
}

interface ContactList {
  id: string;
  name: string;
  description: string | null;
  totalContacts: number;
  validContacts: number;
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
}

interface CampaignEditFormProps {
  campaignId: string;
}

export function CampaignEditForm({ campaignId }: CampaignEditFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [companyCredits, setCompanyCredits] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    type: 'IMMEDIATE' as 'IMMEDIATE' | 'SCHEDULED',
    targetType: 'LIST' as 'LIST' | 'ALL_CONTACTS',
    contactListId: '',
    scheduledAt: '',
    timezone: 'America/Mexico_City',
    templateId: '',
  });

  const [preview, setPreview] = useState({
    recipients: 0,
    estimatedCost: 0,
    messageLength: 0,
    messagePreview: '',
  });

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  useEffect(() => {
    updatePreview();
  }, [formData, contactLists]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignResponse, listsResponse, templatesResponse] = await Promise.all([
        fetch(`/api/dashboard/campaigns/${campaignId}`),
        fetch('/api/dashboard/lists'),
        fetch('/api/dashboard/templates'),
      ]);

      if (campaignResponse.ok) {
        const { campaign } = await campaignResponse.json();
        setCampaign(campaign);
        
        // Initialize form with campaign data
        setFormData({
          name: campaign.name,
          message: campaign.message,
          type: campaign.type,
          targetType: campaign.targetType,
          contactListId: campaign.contactList?.id || '',
          scheduledAt: campaign.scheduledAt ? 
            new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
          timezone: campaign.timezone,
          templateId: campaign.template?.id || '',
        });
        
        setCompanyCredits(campaign.company?.credits || 0);
      }

      if (listsResponse.ok) {
        const listsData = await listsResponse.json();
        setContactLists(listsData.lists || []);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la campaña',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = () => {
    let recipients = 0;
    
    if (formData.targetType === 'LIST' && formData.contactListId) {
      const selectedList = contactLists.find(list => list.id === formData.contactListId);
      recipients = selectedList?.validContacts || 0;
    } else if (formData.targetType === 'ALL_CONTACTS') {
      recipients = contactLists.reduce((sum, list) => sum + list.validContacts, 0);
    }

    const estimatedCost = recipients * 1; // 1 credit per SMS
    const messageLength = formData.message.length;
    
    // Generate preview message (with sample data)
    let messagePreview = formData.message;
    messagePreview = messagePreview.replace(/\{firstName\}/g, 'Juan');
    messagePreview = messagePreview.replace(/\{lastName\}/g, 'Pérez');
    messagePreview = messagePreview.replace(/\{company\}/g, 'Empresa ABC');

    setPreview({
      recipients,
      estimatedCost,
      messageLength,
      messagePreview,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId === 'no-template') {
      setFormData(prev => ({
        ...prev,
        templateId: '',
      }));
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        message: template.content,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la campaña es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'El mensaje es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (formData.targetType === 'LIST' && !formData.contactListId) {
      toast({
        title: 'Error',
        description: 'Selecciona una lista de contactos',
        variant: 'destructive',
      });
      return;
    }

    if (formData.type === 'SCHEDULED' && !formData.scheduledAt) {
      toast({
        title: 'Error',
        description: 'Selecciona la fecha de envío',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Campaña actualizada',
          description: 'Los cambios se han guardado correctamente',
        });

        router.push(`/dashboard/campaigns/${campaignId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la campaña');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaña no encontrada</h1>
          </div>
        </div>
      </div>
    );
  }

  // Check if campaign can be edited
  if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/campaigns/${campaignId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">No se puede editar</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Campaña no editable
            </h3>
            <p className="text-gray-600 mb-4">
              Solo se pueden editar campañas en estado "Borrador" o "Programada".
              Esta campaña está en estado "{campaign.status}".
            </p>
            <Link href={`/dashboard/campaigns/${campaignId}`}>
              <Button>Ver Detalles de la Campaña</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/campaigns/${campaignId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              Detalles de la Campaña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Campaña *</Label>
              <Input
                id="name"
                placeholder="Ej: Promoción de Verano 2024"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateId">Usar Plantilla (Opcional)</Label>
              <Select value={formData.templateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-template">Sin plantilla</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí... Puedes usar variables como {firstName}, {lastName}, {company}"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Variables disponibles: {'{firstName}'}, {'{lastName}'}, {'{company}'}
                </span>
                <span>{formData.message.length} caracteres</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audience Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Selección de Audiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Audiencia</Label>
              <Select 
                value={formData.targetType} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  targetType: value as 'LIST' | 'ALL_CONTACTS',
                  contactListId: value === 'ALL_CONTACTS' ? '' : prev.contactListId
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIST">Lista específica</SelectItem>
                  <SelectItem value="ALL_CONTACTS">Todos los contactos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetType === 'LIST' && (
              <div className="space-y-2">
                <Label htmlFor="contactListId">Lista de Contactos *</Label>
                <Select 
                  value={formData.contactListId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contactListId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lista..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{list.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {list.validContacts} contactos
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-600" />
              Programación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduled"
                checked={formData.type === 'SCHEDULED'}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  type: checked ? 'SCHEDULED' : 'IMMEDIATE' 
                }))}
              />
              <Label htmlFor="scheduled">Programar envío</Label>
            </div>

            {formData.type === 'SCHEDULED' && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Fecha y Hora de Envío *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5 text-orange-600" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Vista previa del SMS:</div>
                <div className="text-sm">
                  {preview.messagePreview || 'Tu mensaje aparecerá aquí...'}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {preview.messageLength} caracteres
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-green-600" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Destinatarios:</span>
              <Badge variant="outline">
                {preview.recipients.toLocaleString()}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Costo estimado:</span>
              <Badge variant="outline">
                {preview.estimatedCost} créditos
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Créditos disponibles:</span>
              <Badge variant={companyCredits >= preview.estimatedCost ? "default" : "destructive"}>
                {companyCredits.toLocaleString()}
              </Badge>
            </div>

            <Separator />

            <Button
              onClick={handleSubmit}
              disabled={saving || preview.estimatedCost > companyCredits}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
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

            {preview.estimatedCost > companyCredits && (
              <div className="text-xs text-red-600 text-center">
                No tienes suficientes créditos para esta campaña
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
