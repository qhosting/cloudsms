
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error de Autenticación</h1>
          <p className="text-gray-600">
            Ha ocurrido un error durante el proceso de autenticación.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg px-6 py-4">
          <p className="text-sm text-gray-700 mb-4">
            Esto puede deberse a credenciales incorrectas o a un problema temporal del servidor.
            Por favor, intenta nuevamente.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Intentar Nuevamente
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signup">
                Crear Nueva Cuenta
              </Link>
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Regresar al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
