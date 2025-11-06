import { NextRequest, NextResponse } from 'next/server';
import { processLabMobileWebhook } from '@/lib/sms-sender';

export const dynamic = 'force-dynamic';

/**
 * Webhook de LabMobile para confirmaciones de entrega
 * Recibe notificaciones cuando un SMS es entregado o falla
 * 
 * Parámetros que envía LabMobile (GET):
 * - subid: Identificador del mensaje
 * - acklevel: Nivel de confirmación (operator, handset, error)
 * - type: Tipo de mensaje (sms, rcs)
 * - desc: Descripción del estado (DELIVRD, FAILED, etc.)
 * - status: Estado (ok, ko)
 * - timestamp: Fecha/hora del evento
 * - msisdn: Número del destinatario
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extraer parámetros del webhook
    const webhookData = {
      subid: searchParams.get('subid') || '',
      acklevel: searchParams.get('acklevel') || '',
      type: searchParams.get('type') || '',
      desc: searchParams.get('desc') || '',
      status: searchParams.get('status') || '',
      timestamp: searchParams.get('timestamp') || '',
      msisdn: searchParams.get('msisdn') || ''
    };

    // Validar parámetros requeridos
    if (!webhookData.subid || !webhookData.desc) {
      console.warn('Webhook recibido con parámetros faltantes:', webhookData);
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes' },
        { status: 400 }
      );
    }

    // Procesar webhook
    await processLabMobileWebhook(webhookData);

    // Responder con OK para confirmar recepción
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing LabMobile delivery webhook:', error);
    
    // Responder con error pero no bloquear reintentos de LabMobile
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

/**
 * También soportar POST para futuros cambios de LabMobile
 */
export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();

    // Validar parámetros requeridos
    if (!webhookData.subid || !webhookData.desc) {
      console.warn('Webhook POST recibido con parámetros faltantes:', webhookData);
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes' },
        { status: 400 }
      );
    }

    // Procesar webhook
    await processLabMobileWebhook(webhookData);

    // Responder con OK
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing LabMobile delivery webhook (POST):', error);
    
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}
