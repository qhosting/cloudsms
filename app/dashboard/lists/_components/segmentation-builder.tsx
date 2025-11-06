
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  X, 
  Filter, 
  AlertCircle,
  Calendar,
  Hash,
  Type,
  Tag,
  ToggleLeft
} from 'lucide-react';

interface SegmentationRule {
  id: string;
  field: string;
  operator: string;
  value: any;
  dataType: string;
}

interface SegmentationCriteria {
  operator: 'AND' | 'OR';
  rules: SegmentationRule[];
}

interface SegmentationBuilderProps {
  criteria: SegmentationCriteria | null;
  onChange: (criteria: SegmentationCriteria | null) => void;
}

export default function SegmentationBuilder({ criteria, onChange }: SegmentationBuilderProps) {
  const [rules, setRules] = useState<SegmentationRule[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');

  // Initialize from props
  useEffect(() => {
    if (criteria) {
      setRules(criteria.rules || []);
      setLogicOperator(criteria.operator || 'AND');
    }
  }, [criteria]);

  // Update parent when rules change
  useEffect(() => {
    if (rules.length > 0) {
      onChange({
        operator: logicOperator,
        rules
      });
    } else {
      onChange(null);
    }
  }, [rules, logicOperator, onChange]);

  // Available fields for segmentation
  const availableFields = [
    // Basic Information
    { value: 'firstName', label: 'Nombre', dataType: 'string', category: 'Información Básica' },
    { value: 'lastName', label: 'Apellido', dataType: 'string', category: 'Información Básica' },
    { value: 'fullName', label: 'Nombre Completo', dataType: 'string', category: 'Información Básica' },
    { value: 'email', label: 'Email', dataType: 'string', category: 'Información Básica' },
    { value: 'phone', label: 'Teléfono', dataType: 'string', category: 'Información Básica' },
    { value: 'company', label: 'Empresa', dataType: 'string', category: 'Información Básica' },
    { value: 'jobTitle', label: 'Cargo', dataType: 'string', category: 'Información Básica' },
    
    // Geographic
    { value: 'city', label: 'Ciudad', dataType: 'string', category: 'Ubicación' },
    { value: 'state', label: 'Estado', dataType: 'string', category: 'Ubicación' },
    { value: 'country', label: 'País', dataType: 'string', category: 'Ubicación' },
    { value: 'zipCode', label: 'Código Postal', dataType: 'string', category: 'Ubicación' },
    
    // Demographics
    { value: 'birthDate', label: 'Fecha de Nacimiento', dataType: 'date', category: 'Demografía' },
    { value: 'age', label: 'Edad', dataType: 'number', category: 'Demografía' },
    { value: 'gender', label: 'Género', dataType: 'string', category: 'Demografía' },
    
    // Engagement
    { value: 'score', label: 'Puntuación', dataType: 'number', category: 'Engagement' },
    { value: 'messageCount', label: 'Cantidad de Mensajes', dataType: 'number', category: 'Engagement' },
    { value: 'campaignCount', label: 'Campañas Participadas', dataType: 'number', category: 'Engagement' },
    { value: 'lastMessageAt', label: 'Último Mensaje', dataType: 'date', category: 'Engagement' },
    { value: 'lastOpenedAt', label: 'Última Apertura', dataType: 'date', category: 'Engagement' },
    { value: 'daysSinceLastMessage', label: 'Días Desde Último Mensaje', dataType: 'number', category: 'Engagement' },
    { value: 'daysSinceCreated', label: 'Días Desde Creación', dataType: 'number', category: 'Engagement' },
    
    // Status
    { value: 'isValid', label: 'Es Válido', dataType: 'boolean', category: 'Estado' },
    { value: 'isActive', label: 'Está Activo', dataType: 'boolean', category: 'Estado' },
    { value: 'isSubscribed', label: 'Está Suscrito', dataType: 'boolean', category: 'Estado' },
    { value: 'subscriptionStatus', label: 'Estado de Suscripción', dataType: 'string', category: 'Estado' },
    
    // Other
    { value: 'tags', label: 'Etiquetas', dataType: 'array', category: 'Otros' },
    { value: 'createdAt', label: 'Fecha de Creación', dataType: 'date', category: 'Otros' },
    { value: 'hasRecentActivity', label: 'Tiene Actividad Reciente', dataType: 'boolean', category: 'Otros' }
  ];

  // Get operators for data type
  const getOperatorsForType = (dataType: string) => {
    const operatorMap: Record<string, { value: string; label: string }[]> = {
      string: [
        { value: 'equals', label: 'Es igual a' },
        { value: 'not_equals', label: 'No es igual a' },
        { value: 'contains', label: 'Contiene' },
        { value: 'not_contains', label: 'No contiene' },
        { value: 'starts_with', label: 'Comienza con' },
        { value: 'ends_with', label: 'Termina con' },
        { value: 'is_empty', label: 'Está vacío' },
        { value: 'is_not_empty', label: 'No está vacío' },
        { value: 'regex_match', label: 'Coincide con expresión regular' }
      ],
      number: [
        { value: 'equals', label: 'Es igual a' },
        { value: 'not_equals', label: 'No es igual a' },
        { value: 'greater_than', label: 'Mayor que' },
        { value: 'less_than', label: 'Menor que' },
        { value: 'greater_equal', label: 'Mayor o igual que' },
        { value: 'less_equal', label: 'Menor o igual que' }
      ],
      date: [
        { value: 'equals', label: 'Es igual a' },
        { value: 'not_equals', label: 'No es igual a' },
        { value: 'after', label: 'Después de' },
        { value: 'before', label: 'Antes de' },
        { value: 'after_equal', label: 'Después o igual a' },
        { value: 'before_equal', label: 'Antes o igual a' },
        { value: 'last_days', label: 'En los últimos N días' }
      ],
      boolean: [
        { value: 'equals', label: 'Es' }
      ],
      array: [
        { value: 'contains', label: 'Contiene' },
        { value: 'not_contains', label: 'No contiene' },
        { value: 'contains_any', label: 'Contiene cualquiera de' },
        { value: 'contains_all', label: 'Contiene todos' },
        { value: 'is_empty', label: 'Está vacío' },
        { value: 'is_not_empty', label: 'No está vacío' }
      ]
    };

    return operatorMap[dataType] || operatorMap.string;
  };

  // Add new rule
  const addRule = () => {
    const newRule: SegmentationRule = {
      id: Date.now().toString(),
      field: 'firstName',
      operator: 'contains',
      value: '',
      dataType: 'string'
    };
    
    setRules(prev => [...prev, newRule]);
  };

  // Update rule
  const updateRule = (ruleId: string, updates: Partial<SegmentationRule>) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === ruleId) {
        const updatedRule = { ...rule, ...updates };
        
        // If field changed, reset operator and value
        if (updates.field) {
          const field = availableFields.find(f => f.value === updates.field);
          if (field) {
            updatedRule.dataType = field.dataType;
            updatedRule.operator = getOperatorsForType(field.dataType)[0]?.value || 'equals';
            updatedRule.value = field.dataType === 'boolean' ? true : '';
          }
        }
        
        return updatedRule;
      }
      return rule;
    }));
  };

  // Remove rule
  const removeRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  // Get field info
  const getFieldInfo = (fieldValue: string) => {
    return availableFields.find(f => f.value === fieldValue);
  };

  // Render value input based on data type
  const renderValueInput = (rule: SegmentationRule) => {
    const fieldInfo = getFieldInfo(rule.field);
    
    if (!fieldInfo) return null;

    // Operators that don't need value input
    const noValueOperators = ['is_empty', 'is_not_empty'];
    if (noValueOperators.includes(rule.operator)) {
      return <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded">No requiere valor</div>;
    }

    switch (fieldInfo.dataType) {
      case 'boolean':
        return (
          <Select 
            value={rule.value?.toString() || 'true'} 
            onValueChange={(value) => updateRule(rule.id, { value: value === 'true' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verdadero</SelectItem>
              <SelectItem value="false">Falso</SelectItem>
            </SelectContent>
          </Select>
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={rule.value || ''}
            onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) || 0 })}
            placeholder="Ingresa un número..."
          />
        );
        
      case 'date':
        if (rule.operator === 'last_days') {
          return (
            <Input
              type="number"
              value={rule.value || ''}
              onChange={(e) => updateRule(rule.id, { value: Number(e.target.value) || 0 })}
              placeholder="Número de días..."
            />
          );
        }
        return (
          <Input
            type="date"
            value={rule.value || ''}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          />
        );
        
      case 'array':
        if (rule.operator === 'contains_any' || rule.operator === 'contains_all') {
          return (
            <Input
              value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value || ''}
              onChange={(e) => {
                const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                updateRule(rule.id, { value: values });
              }}
              placeholder="valor1, valor2, valor3..."
            />
          );
        }
        return (
          <Input
            value={rule.value || ''}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
            placeholder="Ingresa valor..."
          />
        );
        
      case 'string':
      default:
        // Special handling for subscription status
        if (rule.field === 'subscriptionStatus') {
          return (
            <Select 
              value={rule.value || ''} 
              onValueChange={(value) => updateRule(rule.id, { value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUBSCRIBED">Suscrito</SelectItem>
                <SelectItem value="UNSUBSCRIBED">No suscrito</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="BOUNCED">Rebotado</SelectItem>
                <SelectItem value="COMPLAINED">Quejado</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <Input
            value={rule.value || ''}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
            placeholder="Ingresa valor..."
          />
        );
    }
  };

  // Get icon for data type
  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'string': return <Type className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'boolean': return <ToggleLeft className="h-4 w-4" />;
      case 'array': return <Tag className="h-4 w-4" />;
      default: return <Filter className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-blue-600" />
          Criterios de Segmentación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length > 1 && (
          <div className="flex items-center space-x-4">
            <Label>Lógica de combinación:</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={logicOperator === 'OR'}
                onCheckedChange={(checked) => setLogicOperator(checked ? 'OR' : 'AND')}
              />
              <Label>
                {logicOperator === 'AND' ? 'Cumplir TODAS las condiciones' : 'Cumplir CUALQUIER condición'}
              </Label>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {rules.map((rule, index) => {
            const fieldInfo = getFieldInfo(rule.field);
            const operators = getOperatorsForType(rule.dataType);
            
            return (
              <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getDataTypeIcon(rule.dataType)}
                      Regla {index + 1}
                    </Badge>
                    {index > 0 && (
                      <Badge variant="secondary">
                        {logicOperator}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Campo</Label>
                    <Select 
                      value={rule.field} 
                      onValueChange={(value) => updateRule(rule.id, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          availableFields.reduce((acc, field) => {
                            const category = field.category;
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(field);
                            return acc;
                          }, {} as Record<string, typeof availableFields>)
                        ).map(([category, fields]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                              {category}
                            </div>
                            {fields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                <div className="flex items-center gap-2">
                                  {getDataTypeIcon(field.dataType)}
                                  {field.label}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operador</Label>
                    <Select 
                      value={rule.operator} 
                      onValueChange={(value) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op: any) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor</Label>
                    {renderValueInput(rule)}
                  </div>
                </div>

                {fieldInfo && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Tipo: {fieldInfo.dataType} | Categoría: {fieldInfo.category}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addRule}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Regla
        </Button>

        {rules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No hay reglas de segmentación definidas</p>
            <p className="text-sm">Haz clic en "Agregar Regla" para comenzar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
