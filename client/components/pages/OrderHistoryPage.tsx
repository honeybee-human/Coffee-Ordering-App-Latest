import React from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Package, RotateCcw } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/ui/alert-dialog';
import { Order } from '@/types';
import { GroupFilter } from '@/components/shared/GroupFilter';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useModalsStore } from '@/store/useModalsStore';
import { OrderHistoryCard } from '../shared/OrderHistoryCard';
import { SavedSearchBar } from '../shared/SavedSearchBar';

export const OrderHistoryPage: React.FC = () => {
  const { navigateToMenu } = useNavigationStore();
  const orderHistory = useOrdersStore(state => state.orders);
  const { toggleOrderBookmark, clearOrderHistory } = useOrdersStore();
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchMode, setSearchMode] = React.useState<'item' | 'person' | 'group' | 'month'>('item');
  
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

    // Search filters: item, person, group, month (prefix match)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(order => {
        switch (searchMode) {
          case 'person':
            return order.items.some(item => (item.assignedTo || 'Unassigned').toLowerCase().startsWith(q));
          case 'item':
            return order.items.some(item => item.item.name.toLowerCase().startsWith(q));
          case 'group':
            return (order.groupName || '').toLowerCase().startsWith(q);
          case 'month':
            try {
              const monthName = new Date(order.orderDate).toLocaleString('en-US', { month: 'long' }).toLowerCase();
              return monthName.startsWith(q);
            } catch {
              return false;
            }
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [orderHistory, selectedGroup, showBookmarkedOnly, searchQuery, searchMode]);

  const handleToggleBookmark = (orderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleOrderBookmark(orderId);
  };

  const handleClearOrderHistory = () => {
    clearOrderHistory();
  };


  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Order History</h1>
            <p className="text-muted-foreground">
              {showBookmarkedOnly && ' (bookmarked only)'}
            </p>
          </div>
          
          {/* Reset Order History Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-destructive" />
                  Clear Order History
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear all order history? This action cannot be undone and will remove all past orders and bookmarks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearOrderHistory}
                  className="bg-destructive text-destructive-foreground"
                >
                  Clear History
                </AlertDialogAction>
          </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {/* Search row under header with inline bookmark toggle and group filter */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <SavedSearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            mode={searchMode}
            onModeChange={setSearchMode}
            modes={["item","person","group","month"]}
            afterSelectAddon={
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white"
                  aria-label="Toggle bookmarked only"
                  onClick={() => setShowBookmarkedOnly(v => !v)}
                >
                  {showBookmarkedOnly ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
                <GroupFilter
                  groupNames={groupNames.filter((name): name is string => name !== undefined)}
                  selectedGroup={selectedGroup}
                  onChange={setSelectedGroup}
                />
              </div>
            }
          />
        </div>
        
        {/* Removed duplicate GroupFilter to keep single aligned row */}
      </div>

    <div className="space-y-6">
      {orderHistory.length === 0 || filteredOrders.length === 0 ? (
        <div className="relative border border-b-2 border-r-2 rounded-[1px] p-8 bg-white text-center">
          <Package className="h-12 w-12 mx-auto opacity-50 mb-4" />
          <h3 className="mb-2 text-muted-foreground">
            {orderHistory.length === 0 ? 'No Orders Yet' : 'No matching orders'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {orderHistory.length === 0 
              ? 'Your order history will appear here once you place your first order.'
              : 'Try adjusting your filters to see more orders.'}
          </p>
          {orderHistory.length === 0 && (
            <Button onClick={navigateToMenu} className="rounded-lg">Start Ordering</Button>
          )}
        </div>
      ) : (
        filteredOrders.map((order: Order) => (
          <OrderHistoryCard
            key={order.id}
            order={order}
            onToggleBookmark={handleToggleBookmark}
            onReorderToActiveGroup={handleReorderToActiveGroup}
            onReorderToOriginalGroup={handleReorderToOriginalGroup}
            activeGroup={activeGroup}
          />
        ))
      )}
    </div>
    </div>
  );
};