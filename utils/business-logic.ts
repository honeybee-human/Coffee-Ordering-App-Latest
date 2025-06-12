import { AppData, Group, GroupMember, CartItem, FavoriteItem, Order } from '@/types';
import { normalizeAllergens } from '@/utils/allergens';

/**
 * Business logic utilities for managing app operations
 * Handles: groups, cart, favorites, and order management
 */

// Group Management Functions
export const createGroup = (appData: AppData, name: string): AppData => {
  const newGroup: Group = {
    id: `group-${Date.now()}`,
    name,
    members: [],
    cart: [],
    dateCreated: new Date()
  };
  
  return {
    ...appData,
    groups: [...appData.groups, newGroup],
    activeGroupId: newGroup.id
  };
};

export const selectGroup = (appData: AppData, groupId: string): AppData => {
  return {
    ...appData,
    activeGroupId: groupId
  };
};

export const deleteGroup = (appData: AppData, groupId: string): AppData => {
  if (appData.groups.length <= 1) return appData; // Don't delete the last group
  
  const newGroups = appData.groups.filter(g => g.id !== groupId);
  const newActiveGroupId = appData.activeGroupId === groupId 
    ? newGroups[0]?.id || null 
    : appData.activeGroupId;
  
  return {
    ...appData,
    groups: newGroups,
    activeGroupId: newActiveGroupId
  };
};

export const renameGroup = (appData: AppData, groupId: string, newName: string): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    )
  };
};

export const addGroupMember = (appData: AppData, groupId: string, member: GroupMember): AppData => {
  // Normalize allergens when adding member
  const normalizedMember: GroupMember = {
    ...member,
    allergens: normalizeAllergens(member.allergens)
  };

  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === groupId 
        ? { ...g, members: [...g.members, normalizedMember] }
        : g
    )
  };
};

export const removeGroupMember = (appData: AppData, groupId: string, memberName: string): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            members: g.members.filter(m => m.name !== memberName),
            cart: g.cart.filter(item => item.assignedTo !== memberName)
          }
        : g
    )
  };
};

// Cart Management Functions
export const addToCart = (appData: AppData, activeGroupId: string, item: CartItem): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, cart: [...g.cart, item] }
        : g
    )
  };
};

export const removeFromCart = (appData: AppData, activeGroupId: string, itemId: string): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, cart: g.cart.filter(item => item.id !== itemId) }
        : g
    )
  };
};

export const updateCartQuantity = (appData: AppData, activeGroupId: string, itemId: string, quantity: number): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? { 
            ...g, 
            cart: g.cart.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
          }
        : g
    )
  };
};

export const clearCart = (appData: AppData, activeGroupId: string): AppData => {
  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, cart: [] }
        : g
    )
  };
};

// Favorites Management Functions
export const addToFavorites = (appData: AppData, favorite: FavoriteItem): AppData => {
  return {
    ...appData,
    favorites: [favorite, ...appData.favorites]
  };
};

export const removeFromFavorites = (appData: AppData, favoriteId: string): AppData => {
  return {
    ...appData,
    favorites: appData.favorites.filter(fav => fav.id !== favoriteId)
  };
};

export const createFavoriteItem = (type: 'coffee' | 'pastry', item: any, customizations?: any): FavoriteItem => {
  const favoriteId = `${type}-${item.id}-${customizations ? JSON.stringify(customizations) : 'default'}`;
  
  return {
    id: favoriteId,
    type,
    item,
    customizations: customizations || (type === 'coffee' ? { syrups: [], milk: 'Whole Milk' } : { removedIngredients: [] }),
    dateAdded: new Date()
  };
};

// Order Management Functions
export const completeOrder = (appData: AppData, activeGroupId: string, order: Order, groupName: string): AppData => {
  // Add group name to order
  const orderWithGroup = {
    ...order,
    groupName
  };
  
  // Add order to history and clear cart
  return {
    ...appData,
    orderHistory: [orderWithGroup, ...appData.orderHistory],
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? { ...g, cart: [] }
        : g
    )
  };
};

export const reorderItems = (appData: AppData, activeGroupId: string, orderId: string): AppData => {
  const order = appData.orderHistory.find(o => o.id === orderId);
  if (!order) return appData;

  return {
    ...appData,
    groups: appData.groups.map(g => 
      g.id === activeGroupId 
        ? {
            ...g,
            cart: order.items.map(item => ({
              ...item,
              id: `reorder-${Date.now()}-${Math.random()}`
            })),
            members: [...order.groupMembers]
          }
        : g
    )
  };
};

// Helper Functions
export const isItemFavorited = (favorites: FavoriteItem[], type: 'coffee' | 'pastry', itemId: string, customizations?: any): boolean => {
  return favorites.some(fav => 
    fav.type === type && 
    fav.item.id === itemId &&
    (!customizations || JSON.stringify(fav.customizations) === JSON.stringify(customizations))
  );
};

export const findExistingFavorite = (favorites: FavoriteItem[], type: 'coffee' | 'pastry', itemId: string, customizations?: any): FavoriteItem | undefined => {
  return favorites.find(fav => 
    fav.type === type && 
    fav.item.id === itemId &&
    (!customizations || JSON.stringify(fav.customizations) === JSON.stringify(customizations))
  );
};