'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { SMSCharacterEncoding } from '@/lib/labmobile';

interface SMSAlertSystemProps {
  encoding: SMSCharacterEncoding | null;
  validation: { isValid: boolean; errors: string[] };
  cost: number;
  credits: number;
}

export function SMSAlertSystem({
  encoding,
  validation,
  cost,
  credits
}: SMSAlertSystemProps) {
  const getStatusIndicator = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!encoding || encoding.characterCount === 0) return 'info';
    if (validation.errors.length > 0) return 'error';
    if (encoding.parts > 2) return 'error';
    if (encoding.parts > 1) return 'warning';
    return 'success';
  };

  const getStatusConfig = () => {
    const status = getStatusIndicator();
    
    const configs = {
      success: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        message: 'Mensaje válido - Listo para enviar'
      },
      warning: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertTriangle,
        message: `SMS concatenado (${encoding?.parts || 0} partes) - Costo aumentado`
      },
      error: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
        message: validation.errors[0] || 'Mensaje inválido'
      },
      info: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Info,
        message: 'Escribe un mensaje para comenzar'
      }
    };
    
    return configs[status];
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      {/* Alerta principal de estado */}
      <Alert className={`${config.bgColor} ${config.borderColor} border-l-4`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
          <div className="flex-1 space-y-2">
            <p className={`text-sm font-medium ${config.color}`}>
              {config.message}
            </p>
            
            {encoding && encoding.characterCount > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <strong>Caracteres:</strong>
                  <span>{encoding.characterCount}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center space-x-1">
                  <strong>Codificación:</strong>
                  <span>{encoding.type === 'GSM7' ? 'GSM 7-bit' : 'Unicode (UCS-2)'}</span>
                </span>
                {encoding.parts > 1 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center space-x-1">
                      <strong>Partes:</strong>
                      <span className={encoding.parts > 2 ? 'text-red-600 font-semibold' : ''}>
                        {encoding.parts}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Alert>

      {/* Información de costo */}
      {cost > 0 && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Costo estimado:
              </span>
              <Badge variant={cost > credits ? 'destructive' : 'default'} className="text-base">
                {cost.toLocaleString()} crédito{cost !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Créditos disponibles:
              </span>
              <Badge variant="outline">
                {credits.toLocaleString()} crédito{credits !== 1 ? 's' : ''}
              </Badge>
            </div>

            {cost > credits && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Créditos insuficientes.</strong> 
                  Necesitas {(cost - credits).toLocaleString()} créditos adicionales para enviar esta campaña.
                </AlertDescription>
              </Alert>
            )}

            {cost > 0 && cost <= credits && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Balance después del envío:
                  </span>
                  <span className={`font-medium ${
                    (credits - cost) < 100 ? 'text-yellow-600' : 'text-gray-700'
                  }`}>
                    {(credits - cost).toLocaleString()} créditos
                  </span>
                </div>
                {(credits - cost) < 100 && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Tu balance quedará bajo después de este envío. Considera recargar créditos.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recomendaciones específicas */}
      {encoding && encoding.type === 'UNICODE' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            <strong>Tip:</strong> Tu mensaje contiene caracteres especiales (emojis, tildes no-GSM). 
            Puedes reducir el costo usando solo caracteres GSM estándar (a-z, A-Z, 0-9, signos básicos).
          </AlertDescription>
        </Alert>
      )}

      {encoding && encoding.parts > 2 && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-xs text-orange-800">
            <strong>Mensaje largo detectado:</strong> Este mensaje se dividirá en {encoding.parts} partes, 
            lo que aumenta significativamente el costo. Considera:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Acortar el mensaje principal</li>
              <li>Dividir en múltiples campañas</li>
              <li>Usar enlaces acortados para URLs</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
