'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, AlertTriangle, User } from 'lucide-react';
import { 
  CharacterEncodingDetector, 
  SMSCharacterEncoding,
  replaceVariables 
} from '@/lib/labmobile';

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone: string;
}

interface SMSMessage {
  id: string;
  content: string;
  contactName: string;
  encoding: SMSCharacterEncoding;
  isValid: boolean;
}

interface SMSPreviewPanelProps {
  message: string;
  variables?: Record<string, any>;
  contacts: Contact[];
  maxSamples?: number;
}

export function SMSPreviewPanel({
  message,
  variables = {},
  contacts,
  maxSamples = 5
}: SMSPreviewPanelProps) {
  const [previewMessages, setPreviewMessages] = useState<SMSMessage[]>([]);
  const [hasInvalidMessages, setHasInvalidMessages] = useState(false);

  useEffect(() => {
    if (!message || contacts.length === 0) {
      setPreviewMessages([]);
      setHasInvalidMessages(false);
      return;
    }

    // Generar mensajes de muestra con los primeros contactos
    const samples = contacts.slice(0, maxSamples).map(contact => {
      const personalizedMessage = replaceVariables(message, {
        firstName: contact.firstName || '[firstName]',
        lastName: contact.lastName || '[lastName]',
        company: contact.company || '[company]',
        ...variables
      });

      const encoding = CharacterEncodingDetector.calculateParts(personalizedMessage);
      const isValid = encoding.parts <= 3; // Límite de 3 partes

      return {
        id: contact.id,
        content: personalizedMessage,
        contactName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phone,
        encoding,
        isValid
      };
    });

    setPreviewMessages(samples);
    setHasInvalidMessages(samples.some(m => !m.isValid));
  }, [message, variables, contacts, maxSamples]);

  const getPartsColor = (parts: number): string => {
    if (parts === 1) return 'default';
    if (parts === 2) return 'secondary';
    return 'destructive';
  };

  if (!message) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa de Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 text-sm">
            Escribe un mensaje para ver la vista previa
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa de Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Selecciona una lista de contactos para ver la vista previa personalizada
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            <Eye className="mr-2 h-4 w-4" />
            Vista Previa de Mensajes
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {previewMessages.length} de {contacts.length} contactos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {previewMessages.map((preview) => (
              <div
                key={preview.id}
                className={`p-4 border rounded-lg ${
                  preview.isValid ? 'bg-white' : 'bg-red-50 border-red-200'
                }`}
              >
                {/* Header del contacto */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {preview.contactName}
                    </span>
                  </div>
                  <Badge variant={getPartsColor(preview.encoding.parts)}>
                    {preview.encoding.parts} parte{preview.encoding.parts > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Contenido del mensaje */}
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {preview.content}
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {preview.encoding.characterCount} caracteres • {preview.encoding.type}
                  </span>
                  {preview.encoding.parts > 1 && (
                    <span className="text-yellow-600 font-medium">
                      {preview.encoding.parts} créditos
                    </span>
                  )}
                </div>

                {/* Advertencia si es inválido */}
                {!preview.isValid && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      Este mensaje excede el límite de 3 partes
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Advertencia global si hay mensajes inválidos */}
        {hasInvalidMessages && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Algunos mensajes exceden el límite de 3 partes SMS. 
              Considera acortar el mensaje para optimizar costos y mejorar la entrega.
            </AlertDescription>
          </Alert>
        )}

        {/* Información adicional */}
        {contacts.length > maxSamples && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Mostrando {maxSamples} de {contacts.length} contactos. 
              Todos los contactos recibirán mensajes personalizados similares.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
