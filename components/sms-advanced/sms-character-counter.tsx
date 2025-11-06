'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  MessageSquare 
} from 'lucide-react';
import { 
  CharacterEncodingDetector, 
  SMSCharacterEncoding,
  SMSPart,
  SMSConcatenationSplitter
} from '@/lib/labmobile';

interface SMSCharacterCounterProps {
  message: string;
  variables?: Record<string, any>;
  onValidationChange: (isValid: boolean, encoding: SMSCharacterEncoding) => void;
  onPartsChange: (parts: SMSPart[]) => void;
  maxMessages?: number;
}

export function SMSCharacterCounter({
  message,
  variables = {},
  onValidationChange,
  onPartsChange,
  maxMessages = 3
}: SMSCharacterCounterProps) {
  const [encoding, setEncoding] = useState<SMSCharacterEncoding | null>(null);
  const [parts, setParts] = useState<SMSPart[]>([]);
  const [validation, setValidation] = useState({ isValid: true, errors: [] as string[] });

  useEffect(() => {
    if (!message.trim()) {
      setEncoding(null);
      setParts([]);
      setValidation({ isValid: true, errors: [] });
      onValidationChange(true, {
        type: 'GSM7',
        characterCount: 0,
        parts: 0,
        remaining: 160
      });
      onPartsChange([]);
      return;
    }

    // Detectar codificación
    const detectedEncoding = CharacterEncodingDetector.calculateParts(message);
    setEncoding(detectedEncoding);

    // Calcular partes
    const calculatedParts = calculateSMSParts(message, detectedEncoding);
    setParts(calculatedParts);

    // Validar límites
    const validationResult = validateMessage(message, calculatedParts, maxMessages);
    setValidation(validationResult);

    // Notificar cambios
    onValidationChange(validationResult.isValid, detectedEncoding);
    onPartsChange(calculatedParts);
  }, [message, variables, maxMessages, onValidationChange, onPartsChange]);

  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    if (!encoding) return 'success';
    if (validation.errors.length > 0) return 'error';
    if (encoding.parts > 1) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    const status = getStatusColor();
    const iconProps = { className: 'h-5 w-5' };
    
    switch (status) {
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle {...iconProps} className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBgColor = (): string => {
    const status = getStatusColor();
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Contador principal */}
      <div className={`p-4 border rounded-lg ${getStatusBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {encoding?.characterCount || 0}
                </span>
                <span className="text-sm text-gray-600">
                  caracteres
                </span>
                <span className="text-xs text-gray-500">
                  ({encoding?.type || 'Sin contenido'})
                </span>
              </div>
              {encoding && encoding.parts > 1 && (
                <div className="text-sm text-gray-600 mt-1">
                  Se dividirá en <strong>{encoding.parts} partes SMS</strong>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {encoding && (
              <div>
                <div className="text-lg font-semibold text-gray-700">
                  {encoding.remaining}
                </div>
                <div className="text-xs text-gray-500">
                  caracteres restantes
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de partes */}
        {encoding && encoding.parts > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {encoding.parts === 1 ? 'SMS simple' : `SMS concatenado (${encoding.parts} partes)`}
              </span>
              <Badge variant={encoding.parts === 1 ? 'default' : 'secondary'}>
                {encoding.parts} crédito{encoding.parts > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Errores de validación */}
      {validation.errors.length > 0 && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Vista previa de partes (si hay más de 1) */}
      {parts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Vista previa de partes SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {parts.map((part, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Parte {part.partNumber} de {parts.length}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {part.characterCount} caracteres
                  </span>
                </div>
                <Textarea
                  value={part.content}
                  readOnly
                  className="text-sm bg-gray-50 resize-none"
                  rows={3}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Información de codificación */}
      {encoding && encoding.type === 'UNICODE' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Este mensaje contiene caracteres especiales (emojis, acentos no-GSM) y usa codificación Unicode. 
            El límite de caracteres se reduce a 70 por parte en lugar de 160.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Funciones auxiliares
function calculateSMSParts(message: string, encoding: SMSCharacterEncoding): SMSPart[] {
  if (encoding.parts === 1) {
    return [{
      partNumber: 1,
      content: message,
      characterCount: encoding.characterCount,
      isComplete: true
    }];
  }

  return SMSConcatenationSplitter.generateSMSParts(message, encoding.type);
}

function validateMessage(
  message: string, 
  parts: SMSPart[], 
  maxMessages: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!message.trim()) {
    return { isValid: true, errors: [] };
  }

  if (parts.length > maxMessages) {
    errors.push(
      `El mensaje excede el límite de ${maxMessages} partes SMS (actualmente ${parts.length} partes). ` +
      `Considera acortar el mensaje o dividir en múltiples campañas.`
    );
  }

  if (parts.some(part => part.characterCount === 0)) {
    errors.push('Una de las partes del mensaje está vacía');
  }

  return { isValid: errors.length === 0, errors };
}
