import React from 'react';
import { ArrowLeft, Clock, CheckCircle, Package, RefreshCw, User, Calendar, CreditCard, Users, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { Order, CartItem, GroupMember } from '@/types';
import { GroupFilter } from '@/components/shared/GroupFilter';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useModalsStore } from '@/store/useModalsStore';

export const OrderHistoryPage: React.FC = () => {
  const { navigateToMenu } = useNavigationStore();
  const orderHistory = useOrdersStore(state => state.orders);
  const { toggleOrderBookmark } = useOrdersStore();
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { showAllergenWarning } = useModalsStore();
  const { selectGroup } = useGroupsStore();
  const { reorderItems } = useOrdersStore();

  const handleReorderToActiveGroup = (orderId: string) => {
    if (!activeGroup) return;

    const order = orderHistory.find((o: Order) => o.id === orderId);
    if (!order) return;

    // Check for allergen conflicts
    const conflicts = order.items.flatMap((item: CartItem) => {
      const allergens = item.item.allergens || [];
      const affectedMembers = activeGroup.members.filter(member =>
        member.allergens.some(allergen => allergens.includes(allergen))
      );
      return affectedMembers.length > 0 ? {
        itemName: item.item.name,
        allergens,
        affectedMembers
      } : [];
    });

    if (conflicts.length > 0) {
      showAllergenWarning(conflicts[0].allergens, conflicts[0].affectedMembers, conflicts[0].itemName, () => {
        reorderItems(activeGroup.id, orderId);
      });
    } else {
      reorderItems(activeGroup.id, orderId);
    }
  };

  const handleReorderToOriginalGroup = (orderId: string) => {
    const order = orderHistory.find((o: Order) => o.id === orderId);
    if (!order) return;
    
    // Check if the original group still exists
    const originalGroup = useGroupsStore.getState().groups.find(g => g.id === order.groupId);
    if (!originalGroup) {
      return;
    }
    
    // Switch to the original group
    selectGroup(order.groupId);
    
    // Then reorder items to that group
    reorderItems(order.groupId, orderId);
  };

  const [selectedGroup, setSelectedGroup] = React.useState<string>('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = React.useState(false);
  
  // Get unique group names from orders
  const groupNames = Array.from(new Set(orderHistory.map((order: Order) => order.groupName).filter(Boolean)));

  // Filter orders based on selected group and bookmark status
  const filteredOrders = React.useMemo(() => {
    let filtered = orderHistory;
    
    // Filter by group
    if (selectedGroup !== 'all') {
      filtered = filtered.filter((order: Order) => order.groupName === selectedGroup);
    }
    
    // Filter by bookmark status
    if (showBookmarkedOnly) {
      filtered = filtered.filter((order: Order) => order.isBookmarked);
    }
    
    return filtered;
  }, [orderHistory, selectedGroup, showBookmarkedOnly]);

  const handleToggleBookmark = (orderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleOrderBookmark(orderId);
  };

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

  if (orderHistory.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={navigateToMenu} variant="outline">
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
              <Button onClick={navigateToMenu}>Start Ordering</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button onClick={navigateToMenu} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <div>
        <h2 className="text-xl mb-2">Order History</h2>
        <p className="text-muted-foreground mb-4">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          {showBookmarkedOnly && ' (bookmarked only)'}
        </p>
        
        {/* Bookmark filter toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="bookmark-filter"
            checked={showBookmarkedOnly}
            onCheckedChange={setShowBookmarkedOnly}
          />
          <Label htmlFor="bookmark-filter">Show bookmarked orders only</Label>
        </div>
        
        <GroupFilter
          groupNames={groupNames.filter((name): name is string => name !== undefined)}
          selectedGroup={selectedGroup}
          onChange={setSelectedGroup}
        />
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order: Order) => (
          <Card key={order.id} className="overflow-hidden">
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
                    size="sm"
                    onClick={(e) => handleToggleBookmark(order.id, e)}
                    className="p-2"
                  >
                    {order.isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
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
                onClick={() => handleReorderToActiveGroup(order.id)}
                variant="default"
                size="sm"
                className="flex-1 mr-2"
                disabled={!activeGroup}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reorder to Active Group
              </Button>
              
              {order.groupId && useGroupsStore.getState().groups.some(g => g.id === order.groupId) ? (
                <Button
                  onClick={() => handleReorderToOriginalGroup(order.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder to Original Group
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Original Group Unavailable
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};