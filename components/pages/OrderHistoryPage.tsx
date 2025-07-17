import React from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { Order } from '@/types';
import { GroupFilter } from '@/components/shared/GroupFilter';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useModalsStore } from '@/store/useModalsStore';
import { OrderHistoryCard } from '../shared/OrderHistoryCard';

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
    const conflicts = order.items.flatMap((item: any) => {
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

  if (orderHistory.length === 0) {
    return (
      <div className="space-y-4">
        <Button onClick={navigateToMenu} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          
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
    <div className="space-y-6 px-4 pb-16 container mx-auto px-4 py-8">
      <div>
        <h1 className="">Order History</h1>
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
          <OrderHistoryCard
            key={order.id}
            order={order}
            onToggleBookmark={handleToggleBookmark}
            onReorderToActiveGroup={handleReorderToActiveGroup}
            onReorderToOriginalGroup={handleReorderToOriginalGroup}
            activeGroup={activeGroup}
          />
        ))}
      </div>
    </div>
  );
};