
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Activity, 
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Tag,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface ListDetailsViewProps {
  listId: string;
  initialData?: any;
}

export default function ListDetailsView({ listId, initialData }: ListDetailsViewProps) {
  const [listData, setListData] = useState(initialData);
  const [contacts, setContacts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Fetch detailed list data
  const fetchListDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/lists/${listId}`);
      
      if (response.ok) {
        const data = await response.json();
        setListData(data);
        setSubscriptions(data.subscriptions || []);
        setActivities(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching list details:', error);
      toast.error('Error cargando detalles de la lista');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts with pagination and filters
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/dashboard/lists/${listId}/contacts?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error cargando contactos');
    } finally {
      setContactsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialData) {
      fetchListDetails();
    }
    fetchContacts();
  }, [listId, currentPage, searchTerm, statusFilter]);

  // Get type badge
  const getTypeBadge = (type: string) => {
    const typeMap = {
      STATIC: { color: 'bg-blue-100 text-blue-800', label: 'Estática' },
      DYNAMIC: { color: 'bg-green-100 text-green-800', label: 'Dinámica' },
      IMPORTED: { color: 'bg-purple-100 text-purple-800', label: 'Importada' },
      SEGMENT: { color: 'bg-orange-100 text-orange-800', label: 'Segmentada' }
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.STATIC;
    return (
      <Badge className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  // Get subscription status badge
  const getSubscriptionBadge = (status: string) => {
    const statusMap = {
      SUBSCRIBED: { color: 'bg-green-100 text-green-800', label: 'Suscrito' },
      UNSUBSCRIBED: { color: 'bg-red-100 text-red-800', label: 'No suscrito' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      BOUNCED: { color: 'bg-gray-100 text-gray-800', label: 'Rebotado' },
      COMPLAINED: { color: 'bg-purple-100 text-purple-800', label: 'Quejado' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.SUBSCRIBED;
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading && !listData) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Contactos',
      value: listData?.totalContacts || 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Suscritos',
      value: listData?.subscribedContacts || 0,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'No Suscritos',
      value: listData?.unsubscribedContacts || 0,
      icon: UserX,
      color: 'text-red-600'
    },
    {
      title: 'Tasa de Suscripción',
      value: listData?.totalContacts > 0 
        ? `${Math.round((listData.subscribedContacts / listData.totalContacts) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* List Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Tipo</p>
              {listData?.type && getTypeBadge(listData.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <Badge variant={listData?.isActive ? 'success' : 'secondary'}>
                {listData?.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Creada por</p>
              <p className="text-sm">
                {listData?.createdBy?.firstName} {listData?.createdBy?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de creación</p>
              <p className="text-sm">
                {listData?.createdAt && format(new Date(listData.createdAt), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
          
          {listData?.tags && listData.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {listData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed view */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          {listData?.type === 'DYNAMIC' && <TabsTrigger value="criteria">Criterios</TabsTrigger>}
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contactos</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar contactos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="subscribed">Suscritos</SelectItem>
                      <SelectItem value="unsubscribed">No suscritos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Etiquetas</TableHead>
                        <TableHead>Agregado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500">No hay contactos en esta lista</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        contacts.map((contact: any) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contact.phone}
                                  </div>
                                  {contact.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {contact.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {contact.company && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4 text-gray-400" />
                                  <span>{contact.company}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {(contact.city || contact.state) && (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {contact.city}{contact.city && contact.state && ', '}{contact.state}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getSubscriptionBadge(contact.subscriptionStatus)}
                            </TableCell>
                            <TableCell>
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {contact.tags.slice(0, 2).map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {contact.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{contact.tags.length - 2} más
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(contact.createdAt), 'dd MMM', { locale: es })}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, pagination.total)} de {pagination.total} contactos
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === pagination.pages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Suscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {subscriptions.filter((s: any) => s.status === 'SUBSCRIBED').length}
                    </div>
                    <div className="text-sm text-green-700">Suscritos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {subscriptions.filter((s: any) => s.status === 'UNSUBSCRIBED').length}
                    </div>
                    <div className="text-sm text-red-700">No suscritos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {subscriptions.filter((s: any) => s.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-yellow-700">Pendientes</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {subscriptions.filter((s: any) => s.status === 'BOUNCED').length}
                    </div>
                    <div className="text-sm text-gray-700">Rebotados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {subscriptions.filter((s: any) => s.status === 'COMPLAINED').length}
                    </div>
                    <div className="text-sm text-purple-700">Quejados</div>
                  </div>
                </div>

                {/* Recent subscription changes */}
                {subscriptions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Cambios Recientes</h4>
                    <div className="space-y-2">
                      {subscriptions.slice(0, 10).map((sub: any) => (
                        <div key={sub.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="font-medium">
                                {sub.contact.firstName} {sub.contact.lastName}
                              </span>
                              <span className="text-gray-600 ml-2">{sub.contact.phone}</span>
                            </div>
                            {getSubscriptionBadge(sub.status)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(sub.updatedAt), 'dd MMM yyyy', { locale: es })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.contact.firstName} {activity.contact.lastName} - {activity.contact.phone}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(activity.createdAt), 'dd MMM HH:mm', { locale: es })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {listData?.type === 'DYNAMIC' && (
          <TabsContent value="criteria">
            <Card>
              <CardHeader>
                <CardTitle>Criterios de Segmentación Automática</CardTitle>
              </CardHeader>
              <CardContent>
                {listData.segmentCriteria ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Lógica: {listData.segmentCriteria.operator === 'AND' ? 'Cumplir TODAS las condiciones' : 'Cumplir CUALQUIER condición'}
                      </h4>
                      <div className="space-y-2">
                        {listData.segmentCriteria.rules?.map((rule: any, index: number) => (
                          <div key={index} className="p-3 bg-white rounded border">
                            <span className="text-sm">
                              <strong>{rule.field}</strong> {rule.operator} <code>{rule.value}</code>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {listData.allowAutoUpdate && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Actualización automática activada
                      </div>
                    )}
                    
                    {listData.lastSyncAt && (
                      <div className="text-sm text-gray-600">
                        Última sincronización: {format(new Date(listData.lastSyncAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No se han definido criterios de segmentación</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
