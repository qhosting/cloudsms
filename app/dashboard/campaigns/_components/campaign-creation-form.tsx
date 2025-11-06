

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
  Send,
  Loader2,
  Clock,
  CreditCard,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { 
  SMSCharacterCounter, 
  SMSPreviewPanel, 
  SMSAlertSystem 
} from '@/components/sms-advanced';
import { SMSCharacterEncoding, SMSPart, calculateMessageCost } from '@/lib/labmobile';

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

export function CampaignCreationForm() {
  const [loading, setLoading] = useState(false);
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

  // Estado avanzado para SMS
  const [smsEncoding, setSmsEncoding] = useState<SMSCharacterEncoding | null>(null);
  const [smsParts, setSmsParts] = useState<SMSPart[]>([]);
  const [smsValidation, setSmsValidation] = useState({ isValid: true, errors: [] as string[] });
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [formData, contactLists]);

  const fetchData = async () => {
    try {
      const [listsResponse, templatesResponse] = await Promise.all([
        fetch('/api/dashboard/lists'),
        fetch('/api/dashboard/templates'),
      ]);

      if (listsResponse.ok) {
        const listsData = await listsResponse.json();
        setContactLists(listsData.lists || []);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
      }

      // Get company credits
      setCompanyCredits(1000); // This should come from the API
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Actualizar contactos seleccionados cuando cambia la lista
  useEffect(() => {
    const fetchSelectedContacts = async () => {
      if (formData.targetType === 'LIST' && formData.contactListId) {
        try {
          const response = await fetch(`/api/dashboard/lists/${formData.contactListId}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedContacts(data.list?.contacts?.slice(0, 5) || []);
          }
        } catch (error) {
          console.error('Error fetching contacts:', error);
        }
      } else if (formData.targetType === 'ALL_CONTACTS') {
        // Obtener una muestra de todos los contactos
        const allContacts = contactLists.flatMap(list => []);
        setSelectedContacts(allContacts.slice(0, 5));
      } else {
        setSelectedContacts([]);
      }
    };
    
    fetchSelectedContacts();
  }, [formData.contactListId, formData.targetType]);

  const updatePreview = () => {
    let recipients = 0;
    
    if (formData.targetType === 'LIST' && formData.contactListId) {
      const selectedList = contactLists.find(list => list.id === formData.contactListId);
      recipients = selectedList?.validContacts || 0;
    } else if (formData.targetType === 'ALL_CONTACTS') {
      recipients = contactLists.reduce((sum, list) => sum + list.validContacts, 0);
    }

    // Calcular costo real basado en partes SMS
    let estimatedCost = 0;
    if (formData.message && recipients > 0) {
      const costData = calculateMessageCost(formData.message, recipients);
      estimatedCost = costData.totalCost;
    }

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

  const handleSmsValidationChange = (isValid: boolean, encoding: SMSCharacterEncoding) => {
    setSmsEncoding(encoding);
    setSmsValidation(prev => ({ ...prev, isValid }));
  };

  const handleSmsPartsChange = (parts: SMSPart[]) => {
    setSmsParts(parts);
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

  const handleSubmit = async (action: 'draft' | 'send') => {
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

    // Validación avanzada de SMS
    if (!smsValidation.isValid) {
      toast({
        title: 'Error en el mensaje',
        description: 'El mensaje excede el límite permitido de partes SMS',
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

    if (preview.estimatedCost > companyCredits) {
      toast({
        title: 'Error',
        description: 'No tienes suficientes créditos para enviar esta campaña',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { campaign } = await response.json();
        
        toast({
          title: action === 'draft' ? 'Borrador guardado' : 'Campaña creada',
          description: action === 'draft' ? 
            'La campaña se ha guardado como borrador' : 
            'La campaña se ha creado exitosamente',
        });

        // If sending immediately, trigger send
        if (action === 'send' && campaign.status === 'DRAFT') {
          const sendResponse = await fetch(`/api/dashboard/campaigns/${campaign.id}/send`, {
            method: 'POST',
          });

          if (sendResponse.ok) {
            toast({
              title: 'Campaña enviada',
              description: 'La campaña se está enviando a los contactos',
            });
          }
        }

        router.push(`/dashboard/campaigns/${campaign.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la campaña');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/campaigns">
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
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>
                  Variables disponibles: {'{firstName}'}, {'{lastName}'}, {'{company}'}
                </span>
              </div>
              
              {/* Sistema de contador avanzado */}
              <SMSCharacterCounter
                message={formData.message}
                onValidationChange={handleSmsValidationChange}
                onPartsChange={handleSmsPartsChange}
                maxMessages={3}
              />
              
              {/* Sistema de alertas */}
              <SMSAlertSystem
                encoding={smsEncoding}
                validation={smsValidation}
                cost={preview.estimatedCost}
                credits={companyCredits}
              />
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
        {/* Panel de Vista Previa Avanzado */}
        <SMSPreviewPanel
          message={formData.message}
          contacts={selectedContacts}
          maxSamples={5}
        />

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
            
            {formData.type === 'SCHEDULED' && formData.scheduledAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Envío programado:</span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(formData.scheduledAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(formData.scheduledAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Borrador
              </Button>

              <Button
                onClick={() => handleSubmit('send')}
                disabled={loading || preview.estimatedCost > companyCredits || preview.recipients === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : formData.type === 'SCHEDULED' ? (
                  <Clock className="mr-2 h-4 w-4" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {formData.type === 'SCHEDULED' ? 'Programar Campaña' : 'Enviar Ahora'}
              </Button>
            </div>

            {preview.estimatedCost > companyCredits && (
              <div className="text-xs text-red-600 text-center">
                No tienes suficientes créditos para enviar esta campaña
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
