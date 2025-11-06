
import { Metadata } from 'next';
import Link from 'next/link';
import { SignUpForm } from './_components/signup-form';

export const metadata: Metadata = {
  title: 'Registrarse - SMS CloudMX',
  description: 'Crea tu cuenta en SMS CloudMX y comienza a gestionar tus campañas de marketing por SMS.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SMS CloudMX</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Crear Cuenta</h2>
          <p className="text-gray-600">
            Registra tu empresa y comienza con 100 créditos gratuitos
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg px-8 py-6">
          <SignUpForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/auth/signin" 
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 SMS CloudMX. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
