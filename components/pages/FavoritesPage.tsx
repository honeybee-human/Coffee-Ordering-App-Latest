import React, { useState, useMemo } from 'react';
import { ArrowLeft, User, Save, ShoppingCart, Trash2, Eye, Bookmark, Heart, Package, RefreshCw, Calendar, Clock, CreditCard, Users, BookmarkCheck, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Badge } from '@/ui/badge';
import { FavoriteCard } from '../shared/FavoriteCard';
import { CartSetPreviewModal } from '../modals/CartSetPreviewModal';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAllergensStore } from '@/store/useAllergensStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useOrdersStore } from '@/store/useOrdersStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useModalsStore } from '@/store/useModalsStore';
import { AllergenFilter } from '../shared/AllergenFilter';
import { FavoriteItem, CoffeeCustomization, PastryCustomization, CartSetFavorite, Order, CartItem, GroupMember } from '@/types';
import { getAllUniqueAllergens, getGroupBasedAllergens } from '@/utils/filter-utils';
import { calculateCartSubtotal } from '@/utils/cart-calculations';
import { combineIdenticalItems } from '@/utils/cart-helpers';
import { OrderHistoryCard } from '../shared/OrderHistoryCard';

interface PersonFavoritesGroup {
  personName: string;
  favorites: FavoriteItem[];
  isUnassigned?: boolean;
}

export const FavoritesPage: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const getGroupFavorites = useFavoritesStore(state => state.getGroupFavorites);
  const updateFavorite = useFavoritesStore(state => state.updateFavorite);
  const allFavorites = useFavoritesStore(state => state.favorites);
  const { getGroupCartSetFavorites, removeCartSetFromFavorites, updateCartSetName } = useFavoritesStore();
  const excludedAllergens = useAllergensStore(state => state.excludedAllergens);
  const toggleAllergenFilter = useAllergensStore(state => state.toggleAllergenFilter);
  const clearAllergenFilters = useAllergensStore(state => state.clearAllergenFilters);
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { navigateToMenu, navigateToFavoriteDetail, navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();
  const { showAddToCartModal } = useModalsStore();

  // Add bookmarked orders functionality
  const { getBookmarkedOrders, reorderItems, toggleOrderBookmark } = useOrdersStore();
  const bookmarkedOrders = useMemo(() => {
    return activeGroup ? getBookmarkedOrders().filter(order => order.groupId === activeGroup.id) : [];
  }, [activeGroup, getBookmarkedOrders]);

  const favorites = useMemo(() => {
    return activeGroup ? getGroupFavorites(activeGroup.id) : [];
  }, [activeGroup, getGroupFavorites, allFavorites]);

  const cartSetFavorites = useMemo(() => {
    return activeGroup ? getGroupCartSetFavorites(activeGroup.id) : [];
  }, [activeGroup, getGroupCartSetFavorites]);

  const groupAllergens = useMemo(() => {
    const allergenSet = new Set<string>();
    activeGroup?.members.forEach(member => {
      member.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    return Array.from(allergenSet);
  }, [activeGroup?.members]);

  const allAllergens = useMemo(() => {
    return getAllUniqueAllergens({ items: favorites.map(f => f.item) });
  }, [favorites]);

  const groupBasedAllergens = useMemo(() => {
    return getGroupBasedAllergens({
      groupAllergens,
      allAllergens
    });
  }, [groupAllergens, allAllergens]);

  const filteredFavorites = useMemo(() => {
    if (!excludedAllergens.length) return favorites;
    return favorites.filter(favorite =>
      !favorite.item.allergens?.some(allergen => excludedAllergens.includes(allergen))
    );
  }, [favorites, excludedAllergens]);

  // Group favorites by person
  const favoritesByPerson = useMemo(() => {
    const groups: PersonFavoritesGroup[] = [];
    const groupedMap = new Map<string, FavoriteItem[]>();

    // Group favorites by assignedTo
    filteredFavorites.forEach(favorite => {
      const assignedTo = favorite.assignedTo || 'Unassigned';
      if (!groupedMap.has(assignedTo)) {
        groupedMap.set(assignedTo, []);
      }
      groupedMap.get(assignedTo)!.push(favorite);
    });

    // Convert to array and sort (put unassigned at the end)
    const sortedEntries = Array.from(groupedMap.entries()).sort(([a], [b]) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });

    return sortedEntries.map(([personName, favorites]) => ({
      personName,
      favorites,
      isUnassigned: personName === 'Unassigned'
    }));
  }, [filteredFavorites]);

  const filteredOutCount = favorites.length - filteredFavorites.length;

  const handleAddToCart = (favorite: FavoriteItem) => {
    if (activeGroup) {
      const cartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: favorite.type,
        item: favorite.item,
        customizations: favorite.customizations,
        quantity: 1,
        assignedTo: favorite.assignedTo
      };
      useGroupsStore.getState().addToCart(activeGroup.id, {
        ...cartItem,
        type: cartItem.type as 'coffee' | 'pastry' // Explicitly type cast to allowed cart item types
      });
      showAddToCartModal(favorite.item.name);
    }
  };

  const handleAddCartSetToCart = (cartSet: CartSetFavorite) => {
    if (activeGroup) {
      cartSet.items.forEach(item => {
        const cartItem = {
          ...item,
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        useGroupsStore.getState().addToCart(activeGroup.id, cartItem);
      });
      showAddToCartModal(`${cartSet.name} (${cartSet.items.length} items)`);
    }
  };

  const handleReorderBookmarkedOrder = (orderId: string) => {
    const order = bookmarkedOrders.find(o => o.id === orderId);
    if (activeGroup && order) {
      reorderItems(activeGroup.id, order.id);
      showAddToCartModal(`Order #${order.orderNumber} items added to cart`);
    }
  };

  const handleReorderToOriginalGroup = (orderId: string) => {
    const order = bookmarkedOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Check if the original group still exists
    const originalGroup = useGroupsStore.getState().groups.find(g => g.id === order.groupId);
    if (!originalGroup) {
      return;
    }
    
    // Switch to the original group
    useGroupsStore.getState().selectGroup(order.groupId);
    
    // Then reorder items to that group
    reorderItems(order.groupId, order.id);
    showAddToCartModal(`Order #${order.orderNumber} items added to original group`);
  };

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

  const handleEditFavorite = (favorite: FavoriteItem) => {
    if (favorite.type === 'coffee' && 'syrups' in favorite.customizations) {
      navigateToCoffeeDetail(
        favorite.item.id, 
        {
          ...favorite.customizations as CoffeeCustomization,
          assignedTo: favorite.assignedTo
        },
        (newCustomizations: CoffeeCustomization) => {
          if (JSON.stringify(newCustomizations) !== JSON.stringify(favorite.customizations) ||
              newCustomizations.assignedTo !== favorite.assignedTo) {
            updateFavorite(favorite.id, {
              customizations: {
                syrups: newCustomizations.syrups,
                milk: newCustomizations.milk
              },
              assignedTo: newCustomizations.assignedTo
            });
          }
        },
        'favorites' // Add returnTo parameter
      );
    } else if (favorite.type === 'pastry' && 'removedIngredients' in favorite.customizations) {
      navigateToPastryDetail(
        favorite.item.id, 
        {
          ...favorite.customizations as PastryCustomization,
          assignedTo: favorite.assignedTo
        },
        (newCustomizations: PastryCustomization) => {
          if (JSON.stringify(newCustomizations) !== JSON.stringify(favorite.customizations) ||
              newCustomizations.assignedTo !== favorite.assignedTo) {
            updateFavorite(favorite.id, {
              customizations: {
                removedIngredients: newCustomizations.removedIngredients
              },
              assignedTo: newCustomizations.assignedTo
            });
          }
        },
        'favorites' // Add returnTo parameter
      );
    }
  };

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCartSet, setSelectedCartSet] = useState<CartSetFavorite | null>(null);

  const handlePreviewCartSet = (cartSet: CartSetFavorite) => {
    setSelectedCartSet(cartSet);
    setPreviewModalOpen(true);
  };

  const getCustomizationCount = (item: any): number => {
    if (item.type === 'coffee') {
      const customizations = item.customizations as CoffeeCustomization;
      let count = 0;
      
      if (customizations.milk && customizations.milk !== 'Whole Milk') {
        count++;
      }
      
      if (customizations.syrups && customizations.syrups.length > 0) {
        count += customizations.syrups.length;
      }
      
      return count;
    } else {
      const customizations = item.customizations as PastryCustomization;
      return customizations.removedIngredients?.length || 0;
    }
  };

  return (
    <div className="px-4 pb-16 container mx-auto px-4 py-8">
      <div className="flex items-center gap-2">
        <h1 className="">Saved</h1>
      </div>

      <div className='flex w-full md:justify-end'>
        <AllergenFilter 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          excludedAllergens={excludedAllergens}
          onToggleAllergenFilter={toggleAllergenFilter}
          onClearAllergenFilters={clearAllergenFilters}
          allAllergens={allAllergens}
          groupBasedAllergens={groupBasedAllergens}
          filteredOutCount={filteredOutCount}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Items
            {favoritesByPerson.reduce((total, group) => total + group.favorites.length, 0) > 0 && (
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                {favoritesByPerson.reduce((total, group) => total + group.favorites.length, 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cart-sets" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Carts
            {cartSetFavorites.length > 0 && (
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                {cartSetFavorites.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            History
            {bookmarkedOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                {bookmarkedOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Favorites Tab - Redesigned without Cards */}
        <TabsContent value="favorites" className="space-y-6">
          {favoritesByPerson.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg mb-2">No Favorite Items</h3>
              <p>Items you favorite will appear here for quick access.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {favoritesByPerson.map(({ personName, favorites, isUnassigned }) => (
                <div key={personName} className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xl font-semibold border-b pb-2">
                    <User className="h-6 w-6 text-primary" />
                    {isUnassigned ? (
                      <span className="text-muted-foreground">Unassigned Items</span>
                    ) : (
                      <span>{personName}</span>
                    )}
                    <span className="text-sm text-muted-foreground font-normal">
                      ({favorites.length} item{favorites.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {favorites.map(fav => (
                      <FavoriteCard
                        key={fav.id}
                        favorite={fav as FavoriteItem & { type: "coffee" | "pastry" }}
                        groupAllergens={groupAllergens}
                        groupMembers={activeGroup?.members || []}
                        onAddToCart={() => handleAddToCart(fav)}
                        onNavigateToDetail={() => navigateToFavoriteDetail(fav)}
                        onEdit={() => handleEditFavorite(fav)}
                        formatCustomizations={(favorite) => {
                          if (favorite.type === 'coffee') {
                            const customizations = favorite.customizations as any;
                            const parts = [];
                            
                            if (customizations.milk && customizations.milk !== 'Whole Milk') {
                              parts.push(`• ${customizations.milk}`);
                            }
                            
                            if (customizations.syrups?.length > 0) {
                              customizations.syrups.forEach((syrup: any) => {
                                parts.push(`• ${syrup.pumps} pump${syrup.pumps !== 1 ? 's' : ''} ${syrup.flavor}`);
                              });
                            }
                            
                            return parts.join('\n');
                          } else {
                            const customizations = favorite.customizations as any;
                            if (customizations.removedIngredients?.length > 0) {
                              return customizations.removedIngredients.map((ingredient: string) => `• No ${ingredient}`).join('\n');
                            }
                            return '';
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cart Sets Tab */}
        <TabsContent value="cart-sets" className="space-y-6">
          {cartSetFavorites.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg mb-2">No Saved Cart Sets</h3>
              <p>Save your cart as a set for quick reordering.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartSetFavorites.map(cartSet => {
                const combinedItems = combineIdenticalItems(cartSet.items);
                const totalItems = cartSet.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <Card key={cartSet.id} className="border-none shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{cartSet.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {combinedItems.length} unique items ({totalItems} total) • ${cartSet.totalAmount.toFixed(2)}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-1 mb-3">
                        {combinedItems.slice(0, 3).map((item, index) => {
                          const customizationCount = getCustomizationCount(item);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground flex-1">
                                {item.quantity}x {item.item.name}
                                {item.assignedTo && ` (${item.assignedTo})`}
                              </p>
                              {customizationCount > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-[1px] ml-2">
                                  {customizationCount} customization {customizationCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {combinedItems.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{combinedItems.length - 3} more items
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handlePreviewCartSet(cartSet)}
                        >
                          <Eye className="h-5 w-5 md:mr-1" />
                          <span className="hidden md:inline">Preview</span>
                        </Button>
                        <Button 
                          size="icon" 
                          className="flex-1"
                          onClick={() => handleAddCartSetToCart(cartSet)}
                        >
                          <ShoppingCart className="h-5 w-5 md:mr-1" />
                          <span className="hidden md:inline">Add to Cart</span>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => removeCartSetFromFavorites(cartSet.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Bookmarked Orders Tab - Using OrderHistoryCard component */}
        <TabsContent value="bookmarked" className="space-y-6">
          {bookmarkedOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg mb-2">No Bookmarked Orders</h3>
              <p>Bookmark orders from your order history for quick reordering.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookmarkedOrders.map((order: Order) => (
                <OrderHistoryCard
                  key={order.id}
                  order={order}
                  onToggleBookmark={handleToggleBookmark}
                  onReorderToActiveGroup={handleReorderBookmarkedOrder}
                  onReorderToOriginalGroup={handleReorderToOriginalGroup}
                  activeGroup={activeGroup}
                  hideOriginalButton={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Render the CartSetPreviewModal */}
      {selectedCartSet && (
        <CartSetPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedCartSet(null);
          }}
          cartSet={selectedCartSet}
          onAddToCart={() => {
            handleAddCartSetToCart(selectedCartSet);
            setPreviewModalOpen(false);
            setSelectedCartSet(null);
          }}
        />
      )}
    </div>
  );
};