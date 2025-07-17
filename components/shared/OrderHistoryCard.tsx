import React from 'react';
import { Clock, CheckCircle, Package, RefreshCw, User, Calendar, CreditCard, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Order, CartItem, GroupMember } from '@/types';
import { useGroupsStore } from '@/store/useGroupsStore';

interface OrderHistoryCardProps {
  order: Order;
  onToggleBookmark: (orderId: string, event: React.MouseEvent) => void;
  onReorderToActiveGroup: (orderId: string) => void;
  onReorderToOriginalGroup: (orderId: string) => void;
  activeGroup: any;
  hideOriginalButton?: boolean; // New prop to hide the "Original" button
}

export const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  order,
  onToggleBookmark,
  onReorderToActiveGroup,
  onReorderToOriginalGroup,
  activeGroup,
  hideOriginalButton = false
}) => {
  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: Order['status']) => {
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

  return (
    <Card className="border-none overflow-hidden shadow-lg">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">Order #{order.orderNumber}</h3>
              {order.groupName && (
                <p className="text-sm font-medium text-primary">{order.groupName}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{new Date(order.orderDate).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onToggleBookmark(order.id, e)}
              className="p-2"
            >
              {order.isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items by Person */}
          <div className="space-y-4">
            {(() => {
              // Group items by assigned person
              const itemsByPerson = order.items.reduce((acc: Record<string, CartItem[]>, item: CartItem) => {
                const assignedTo = item.assignedTo || 'Unassigned';
                if (!acc[assignedTo]) acc[assignedTo] = [];
                acc[assignedTo].push(item);
                return acc;
              }, {});

              return Object.entries(itemsByPerson).map(([person, items]) => (
                <div key={person} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    <span>{person}</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {items.map((item: CartItem, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.item.name}</span>
                        <span className="text-muted-foreground">
                          ${(item.item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Order Details */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            {order.paymentInfo && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Credit Card</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Group Members */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span>Group Members</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.groupMembers.map((member: GroupMember) => (
                <Badge key={member.name} variant="secondary">
                  <User className="h-3 w-3 mr-1" />
                  {member.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 flex justify-between">
        <Button
          onClick={() => onReorderToActiveGroup(order.id)}
          variant="default"
          size="icon"
          className={hideOriginalButton ? "flex-1" : "flex-1 mr-2"}
          disabled={!activeGroup}
        >
          <RefreshCw className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Active</span>
        </Button>
        
        {!hideOriginalButton && (
          order.groupId && useGroupsStore.getState().groups.some(g => g.id === order.groupId) ? (
            <Button
              onClick={() => onReorderToOriginalGroup(order.id)}
              variant="outline"
              size="icon"
              className="flex-1"
            >
              <RefreshCw className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Original</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="flex-1"
              disabled
            >
              <RefreshCw className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Original Group Unavailable</span>
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};