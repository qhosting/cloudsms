
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/auth';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'SMS CloudMX - Plataforma Líder en Marketing por SMS',
  description: 'Transforma tu estrategia de marketing con SMS CloudMX. Gestiona contactos, crea campañas personalizadas y alcanza a tus clientes directamente en sus móviles.',
};

export default async function HomePage() {
  // Check if user is authenticated and redirect to appropriate dashboard
  const session = await getServerSession(authOptions);
  
  if (session) {
    if (session.user.role === 'SUPER_ADMIN') {
      redirect('/super-admin');
    } else if (['COMPANY_ADMIN', 'USER'].includes(session.user.role)) {
      redirect('/dashboard');
    }
  }
  const features = [
    {
      icon: MessageSquare,
      title: 'Campañas Personalizadas',
      description: 'Crea mensajes únicos con variables dinámicas como nombres y datos personales.'
    },
    {
      icon: Users,
      title: 'Gestión de Contactos',
      description: 'Importa y organiza tus listas de contactos desde Excel o CSV fácilmente.'
    },
    {
      icon: BarChart3,
      title: 'Análisis en Tiempo Real',
      description: 'Monitorea entregas, aperturas y el rendimiento de tus campañas al instante.'
    },
    {
      icon: Shield,
      title: 'Datos Seguros',
      description: 'Tu información y la de tus clientes están protegidos con encriptación avanzada.'
    },
    {
      icon: Clock,
      title: 'Programación Inteligente',
      description: 'Programa tus campañas para el momento perfecto y maximiza el impacto.'
    },
    {
      icon: Globe,
      title: 'Alcance Global',
      description: 'Envía mensajes a nivel nacional e internacional con tarifas competitivas.'
    },
  ];

  const benefits = [
    'Registro gratuito con 100 créditos de bienvenida',
    'Interfaz intuitiva y fácil de usar',
    'Soporte técnico especializado',
    'Reportes detallados de todas las campañas',
    'API para integraciones personalizadas',
    'Sin contratos de permanencia'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-indigo-600">SMS CloudMX</span>
              <br />
              Marketing Directo e Inmediato
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              La plataforma más completa para crear, gestionar y analizar tus campañas de SMS marketing.
              Conecta con tus clientes de manera personal y efectiva.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/auth/signup" className="flex items-center">
                  Crear Cuenta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">
                  Iniciar Sesión
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              🎉 <strong>Oferta de Lanzamiento:</strong> 100 SMS gratuitos al registrarte
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para maximizar el impacto de tus campañas SMS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir SMS CloudMX?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Más de 1,000 empresas confían en nosotros para sus estrategias de marketing digital.
                Únete y descubre por qué somos la opción preferida.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/auth/signup" className="flex items-center">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Planes Flexibles
              </h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Plan Starter</h4>
                  <p className="text-gray-600">Perfecto para empezar</p>
                  <p className="text-2xl font-bold text-indigo-600">$0.80 <span className="text-sm text-gray-500">por SMS</span></p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Plan Business</h4>
                  <p className="text-gray-600">Para empresas en crecimiento</p>
                  <p className="text-2xl font-bold text-indigo-600">$0.65 <span className="text-sm text-gray-500">por SMS</span></p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Plan Enterprise</h4>
                  <p className="text-gray-600">Soluciones personalizadas</p>
                  <p className="text-2xl font-bold text-indigo-600">Contactar <span className="text-sm text-gray-500">para cotizar</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para revolucionar tu marketing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a miles de empresas que ya están transformando su comunicación con SMS CloudMX
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup" className="flex items-center">
                Crear Cuenta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600" asChild>
              <Link href="/auth/signin">
                Acceder a mi Cuenta
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">SMS CloudMX</h3>
            <p className="text-gray-400 mb-6">
              La plataforma más confiable para tu marketing por SMS
            </p>
            <div className="text-sm text-gray-500">
              © 2024 SMS CloudMX. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
