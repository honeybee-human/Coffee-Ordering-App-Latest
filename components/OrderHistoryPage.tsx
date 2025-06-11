import React from 'react';
import { ArrowLeft, Clock, CheckCircle, Package, RefreshCw, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Order, CartItem } from '../types';
import { GroupOrderSummary } from './GroupOrderSummary';

interface OrderHistoryPageProps {
  orders: Order[];
  onBack: () => void;
  onReorder: (orderId: string) => void;
  getAllAllergens: (item: CartItem) => string[];
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  orders,
  onBack,
  onReorder,
  getAllAllergens
}) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'preparing':
        return 'default';
      case 'ready':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatCustomizations = (item: CartItem): string => {
    if (item.type === 'coffee') {
      const custom = item.customizations as any;
      const parts: string[] = [];
      
      if (custom.milk !== 'Whole Milk') {
        parts.push(`${custom.milk}`);
      }
      
      if (custom.syrups && custom.syrups.length > 0) {
        const syrupText = custom.syrups
          .map((s: any) => `${s.pumps} pump${s.pumps !== 1 ? 's' : ''} ${s.flavor}`)
          .join(', ');
        parts.push(syrupText);
      }
      
      return parts.join(', ');
    } else {
      const custom = item.customizations as any;
      if (custom.removedIngredients && custom.removedIngredients.length > 0) {
        return `No ${custom.removedIngredients.join(', ')}`;
      }
      return '';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your order history will appear here once you place your first order.
              </p>
              <Button onClick={onBack}>Start Ordering</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <div>
        <h2 className="text-xl mb-2">Order History</h2>
        <p className="text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <>
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <CardTitle className="text-base">
                      Order #{order.orderNumber}
                    </CardTitle>
                  </div>
                  <Badge variant={getStatusColor(order.status) as any}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                  {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}                  </p>
                  <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{item.item.name}</span>
                          {item.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {item.assignedTo}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${item.item.price.toFixed(2)} × {item.quantity}
                        </p>
                        {formatCustomizations(item) && (
                          <p className="text-sm text-muted-foreground">
                            {formatCustomizations(item)}
                          </p>
                        )}
                      </div>
                      <span className="text-sm">${(item.item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Payment: {order.paymentInfo?.cardNumber.slice(-4) || 'N/A'}</span>
                  {order.estimatedTime && (
                    <span>Est. {order.estimatedTime} min</span>
                  )}
                  {order.groupMembers.length > 0 && (
                    <span>{order.groupMembers.length} member{order.groupMembers.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReorder(order.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              </div>
            </CardContent>
          </Card>
                  </>
        ))}
      </div>
    </div>
  );
};