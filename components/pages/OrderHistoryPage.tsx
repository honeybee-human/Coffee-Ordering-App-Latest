import React from 'react';
import { ArrowLeft, Clock, CheckCircle, Package, RefreshCw, User, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Order, CartItem } from '@/types';
import { GroupOrderContent } from '@/components/features/GroupOrderContent';

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

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    {order.paymentInfo ? `Card ending in ${order.paymentInfo.cardNumber.slice(-4)}` : 'Payment info not available'}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <GroupOrderContent 
                cartItems={order.items} 
                groupMembers={order.groupMembers} 
                getAllAllergens={getAllAllergens} 
                groupName={order.groupName}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between items-center border-t bg-muted/20 py-4">
              <div className="flex items-center gap-4">
                <div className="font-medium">
                  Total: ${order.totalAmount.toFixed(2)}
                </div>
                {order.estimatedTime && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Est. {order.estimatedTime} min
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => onReorder(order.id)}
                variant="default"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};