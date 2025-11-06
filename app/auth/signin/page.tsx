
import { Metadata } from 'next';
import Link from 'next/link';
import { SignInForm } from './_components/signin-form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - SMS CloudMX',
  description: 'Accede a tu cuenta de SMS CloudMX para gestionar tus campañas de marketing por SMS.',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SMS CloudMX</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">
            Accede a tu plataforma de marketing por SMS
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg px-8 py-6">
          <SignInForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Regístrate aquí
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
