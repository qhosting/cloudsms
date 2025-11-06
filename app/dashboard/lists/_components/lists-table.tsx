
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface ContactList {
  id: string;
  name: string;
  description?: string;
  type: string;
  totalContacts: number;
  subscribedContacts: number;
  validContacts: number;
  isActive: boolean;
  tags: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface ListsResponse {
  lists: ContactList[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ListsTable() {
  const router = useRouter();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch lists
  const fetchLists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        sortBy,
        sortOrder,
        ...(typeFilter !== 'all' && { type: typeFilter })
      });

      const response = await fetch(`/api/dashboard/lists?${params}`);
      
      if (!response.ok) {
        throw new Error('Error loading lists');
      }

      const data: ListsResponse = await response.json();
      setLists(data.lists);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Error cargando listas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [currentPage, searchTerm, typeFilter, sortBy, sortOrder]);

  // Delete list
  const handleDelete = async (listId: string, listName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la lista "${listName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error eliminando lista');
      }

      toast.success('Lista eliminada exitosamente');
      fetchLists(); // Reload lists
    } catch (error: any) {
      console.error('Error deleting list:', error);
      toast.error(error.message || 'Error eliminando lista');
    }
  };

  // Get type badge color and label
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar listas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="STATIC">Estática</SelectItem>
            <SelectItem value="DYNAMIC">Dinámica</SelectItem>
            <SelectItem value="IMPORTED">Importada</SelectItem>
            <SelectItem value="SEGMENT">Segmentada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-');
          setSortBy(field);
          setSortOrder(order);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Más recientes</SelectItem>
            <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
            <SelectItem value="name-asc">Nombre A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre Z-A</SelectItem>
            <SelectItem value="totalContacts-desc">Más contactos</SelectItem>
            <SelectItem value="totalContacts-asc">Menos contactos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lista</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contactos</TableHead>
              <TableHead>Suscritos</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>No se encontraron listas</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => router.push('/dashboard/lists/new')}
                    >
                      Crear primera lista
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {list.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: list.color }}
                          />
                        )}
                        <span className="font-medium">{list.name}</span>
                      </div>
                      {list.description && (
                        <p className="text-sm text-gray-500">{list.description}</p>
                      )}
                      {list.tags.length > 0 && (
                        <div className="flex gap-1">
                          {list.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {list.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{list.tags.length - 3} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getTypeBadge(list.type)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium">{list.totalContacts.toLocaleString()}</span>
                      <div className="text-xs text-gray-500">
                        {list.validContacts} válidos
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium text-green-600">
                        {list.subscribedContacts.toLocaleString()}
                      </span>
                      {list.totalContacts > 0 && (
                        <div className="text-xs text-gray-500">
                          {Math.round((list.subscribedContacts / list.totalContacts) * 100)}%
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {format(new Date(list.createdAt), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {list.createdBy.firstName} {list.createdBy.lastName}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={list.isActive ? 'success' : 'secondary'}>
                      {list.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => router.push(`/dashboard/lists/${list.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push(`/dashboard/lists/${list.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push(`/dashboard/lists/${list.id}/segment`)}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Segmentar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(list.id, list.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, pagination.total)} de {pagination.total} listas
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
  );
}
