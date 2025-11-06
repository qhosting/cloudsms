

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Check, X, Shield, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BulkActionsProps {
  selectedUsers: string[];
  allUsers: any[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export function BulkActions({ selectedUsers, allUsers, onActionComplete, onClearSelection }: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  if (selectedUsers.length === 0) {
    return null;
  }

  const selectedUserDetails = allUsers.filter(user => selectedUsers.includes(user.id));

  const handleBulkAction = async () => {
    if (!action) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/super-admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '¡Acción completada exitosamente!',
          description: `Se procesaron ${selectedUsers.length} usuarios correctamente`,
        });

        setIsDialogOpen(false);
        setAction('');
        onClearSelection();
        onActionComplete();
      } else {
        throw new Error(data.error || 'Error al procesar la acción masiva');
      }
    } catch (error: any) {
      toast({
        title: 'Error en acción masiva',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'activate':
        return 'Activar todos los usuarios seleccionados';
      case 'deactivate':
        return 'Desactivar todos los usuarios seleccionados';
      case 'make_user':
        return 'Cambiar rol a Usuario para todos los seleccionados';
      case 'make_admin':
        return 'Cambiar rol a Admin de Empresa para todos los seleccionados';
      default:
        return '';
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'activate':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'deactivate':
        return <X className="h-4 w-4 text-red-600" />;
      case 'make_user':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'make_admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Users className="mr-2 h-5 w-5 text-blue-600" />
          Acciones Masivas ({selectedUsers.length} usuarios seleccionados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Selected Users Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Usuarios seleccionados:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedUserDetails.slice(0, 5).map((user) => (
                <Badge key={user.id} variant="secondary" className="text-xs">
                  {user.firstName} {user.lastName}
                </Badge>
              ))}
              {selectedUsers.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedUsers.length - 5} más
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar acción..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activar usuarios</SelectItem>
                  <SelectItem value="deactivate">Desactivar usuarios</SelectItem>
                  <SelectItem value="make_user">Cambiar rol a Usuario</SelectItem>
                  <SelectItem value="make_admin">Cambiar rol a Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!action}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar Acción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    {getActionIcon()}
                    <span className="ml-2">Confirmar Acción Masiva</span>
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <p>
                      <strong>Acción:</strong> {getActionDescription()}
                    </p>
                    <p>
                      <strong>Usuarios afectados:</strong> {selectedUsers.length}
                    </p>
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Advertencia:</strong> Esta acción se aplicará a todos los usuarios 
                        seleccionados y será registrada en los logs del sistema. 
                        {action === 'deactivate' && ' Los usuarios desactivados no podrán iniciar sesión.'}
                      </p>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Usuarios que serán modificados:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedUserDetails.map((user) => (
                          <div key={user.id} className="text-xs text-gray-600 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {user.firstName} {user.lastName} ({user.email})
                            <Badge className="ml-2 text-xs" variant="outline">
                              {user.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleBulkAction}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {getActionIcon()}
                        <span className="ml-2">Confirmar Acción</span>
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={onClearSelection}
              size="sm"
            >
              Limpiar Selección
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
