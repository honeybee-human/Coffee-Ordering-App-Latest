import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Group, CartItem, GroupMember, PageType, AppState, FavoriteItem, CartSetFavorite, CoffeeCustomization, PastryCustomization } from '@/types';
import { getApiBase, logAPI } from '@/utils/devLogger';

type AppContextValue = {
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
  currentPage: PageType;
  setCurrentPage: (p: PageType) => void;
  appState: AppState;
  setAppState: (s: AppState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  returnToPage?: 'cart' | 'favorites';
  setReturnToPage: (p: 'cart' | 'favorites' | undefined) => void;
  groups: Group[];
  loading: boolean;
  error?: string;
  // Derived
  currentGroup: Group | null;
  cart: CartItem[];
  members: GroupMember[];
  // Cart ops
  setCart: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  // Customization state (coffee)
  coffeeCustomization: CoffeeCustomization;
  setCoffeeCustomization: (c: CoffeeCustomization) => void;
  setCoffeeMilk: (milk: string) => void;
  addCoffeeSyrup: (flavor: string) => void;
  updateCoffeeSyrupPumps: (flavor: string, pumps: number) => void;
  removeCoffeeSyrup: (flavor: string) => void;
  resetCoffeeCustomization: () => void;
  // Customization state (pastry)
  pastryCustomization: PastryCustomization;
  setPastryCustomization: (c: PastryCustomization) => void;
  togglePastryIngredient: (ingredient: string) => void;
  resetPastryCustomization: () => void;
  // Navigation ops
  navigateToLanding: () => void;
  navigateToMenu: () => void;
  navigateToCart: () => void;
  navigateToGroups: () => void;
  navigateToCoffeeDetail: (
    coffeeId: string,
    initialCustomizations?: CoffeeCustomization,
    onSave?: (customizations: CoffeeCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => void;
  navigateToPastryDetail: (
    pastryId: string,
    initialCustomizations?: PastryCustomization,
    onSave?: (customizations: PastryCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => void;
  navigateToCheckout: () => void;
  navigateToOrderHistory: () => void;
  navigateToFavorites: () => void;
  navigateBack: () => void;
  // Favorites
  favorites: FavoriteItem[];
  cartSetFavorites: CartSetFavorite[];
  addToFavorites: (favorite: FavoriteItem) => void;
  removeFromFavorites: (favoriteId: string) => void;
  updateFavorite: (favoriteId: string, updates: Partial<FavoriteItem>) => void;
  getGroupFavorites: (groupId: string) => FavoriteItem[];
  getMemberFavorites: (memberName: string) => FavoriteItem[];
  cleanupMemberFavorites: (memberName: string, groupId: string) => void;
  transferMemberFavorites: (memberName: string, fromGroupId: string, toGroupId: string) => void;
  isItemFavorited: (
    type: 'coffee' | 'pastry',
    itemId: string,
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization,
    assignedTo?: string
  ) => boolean;
  toggleFavorite: (
    type: 'coffee' | 'pastry',
    item: any,
    groupId: string,
    customizations?: CoffeeCustomization | PastryCustomization,
    assignedTo?: string
  ) => void;
  resetFavorites: () => void;
  addCartSetToFavorites: (name: string, cartItems: CartItem[], groupId: string) => void;
  removeCartSetFromFavorites: (cartSetId: string) => void;
  getGroupCartSetFavorites: (groupId: string) => CartSetFavorite[];
  updateCartSetName: (cartSetId: string, newName: string) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const mapGroupFromServer = (g: any): Group => ({
  id: String(g?._id ?? g?.id ?? ''),
  name: String(g?.name ?? 'Unnamed Group'),
  members: Array.isArray(g?.members)
    ? g.members.map((m: any) => ({ name: String(m?.name ?? ''), allergens: Array.isArray(m?.allergens) ? m.allergens : [] }))
    : [],
  cart: Array.isArray(g?.cart) ? [] : [],
  dateCreated: g?.dateCreated ? new Date(g.dateCreated) : new Date(),
  isFavorite: Boolean(g?.isFavorite),
});

const mapCartItemsFromServer = (data: any): CartItem[] => {
  if (!Array.isArray(data)) return [];
  // Server cart schema may differ; provide best-effort mapping.
  return data
    .map((ci: any) => {
      const type: 'coffee' | 'pastry' = ci?.type === 'pastry' ? 'pastry' : 'coffee';
      const baseItem = ci?.item ?? ci?.baseItem ?? {};
      const base = {
        id: String(baseItem?._id ?? baseItem?.id ?? ci?.baseItemId ?? ''),
        name: String(baseItem?.name ?? 'Item'),
        price: Number(baseItem?.price ?? 0),
        allergens: Array.isArray(baseItem?.allergens) ? baseItem.allergens : [],
        description: baseItem?.description,
        image: baseItem?.image,
      } as any;
      const item = type === 'coffee' ? { ...base, syrupOptions: Array.isArray(baseItem?.syrupOptions) ? baseItem.syrupOptions : [] } : { ...base, removableIngredients: Array.isArray(baseItem?.removableIngredients) ? baseItem.removableIngredients : [] };
      const customizations = ci?.customizations ?? (type === 'coffee' ? { syrups: [], milk: 'Whole Milk' } : { removedIngredients: [] });
      return {
        id: String(ci?.id ?? ci?._id ?? `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`),
        type,
        item,
        customizations,
        quantity: Number(ci?.quantity ?? 1),
        assignedTo: ci?.assignedTo ?? undefined,
      } as CartItem;
    })
    .filter(Boolean);
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGroupId, setCurrentGroupIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('app-current-group-id');
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [appState, setAppState] = useState<AppState>({ currentPage: 'landing' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [returnToPage, setReturnToPage] = useState<'cart' | 'favorites' | undefined>(undefined);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [cartSetFavorites, setCartSetFavorites] = useState<CartSetFavorite[]>([]);
  const [coffeeCustomization, setCoffeeCustomizationState] = useState<CoffeeCustomization>({ milk: 'Whole Milk', syrups: [] });
  const [pastryCustomization, setPastryCustomizationState] = useState<PastryCustomization>({ removedIngredients: [] });

  const setCurrentGroupId = useCallback((id: string | null) => {
    setCurrentGroupIdState(id);
    try {
      if (id) localStorage.setItem('app-current-group-id', id);
      else localStorage.removeItem('app-current-group-id');
    } catch {}
  }, []);

  const currentGroup = useMemo(() => groups.find((g) => g.id === currentGroupId) || null, [groups, currentGroupId]);
  const cart = currentGroup?.cart || [];
  const members = currentGroup?.members || [];

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError(undefined);
      const base = getApiBase();
      logAPI('/groups', 'start');
      try {
        const res = await fetch(`${base}/groups`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const mapped: Group[] = Array.isArray(data) ? data.map(mapGroupFromServer) : [];
        setGroups(mapped);
        if (!currentGroupId && mapped.length > 0) {
          setCurrentGroupId(mapped[0].id);
        }
        logAPI('/groups', 'success', { count: mapped.length });
      } catch (e) {
        setError(String(e));
        logAPI('/groups', 'error', { error: String(e) });
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  // Load current group details and cart when active group changes
  useEffect(() => {
    if (!currentGroupId) return;
    const base = getApiBase();
    const loadCurrentGroup = async () => {
      logAPI(`/groups/${currentGroupId}`, 'start');
      try {
        const res = await fetch(`${base}/groups/${currentGroupId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = mapGroupFromServer(data);
          setGroups((prev) => {
            const idx = prev.findIndex((g) => g.id === mapped.id);
            if (idx >= 0) {
              // Keep existing cart while merging other fields
              const merged = { ...mapped, cart: prev[idx].cart };
              return [...prev.slice(0, idx), merged, ...prev.slice(idx + 1)];
            }
            return [...prev, mapped];
          });
          logAPI(`/groups/${currentGroupId}`, 'success');
        }
      } catch (e) {
        logAPI(`/groups/${currentGroupId}`, 'error', { error: String(e) });
      }

      // Load cart
      logAPI(`/groups/${currentGroupId}/cart`, 'start');
      try {
        const res2 = await fetch(`${base}/groups/${currentGroupId}/cart`);
        if (res2.ok) {
          const data2 = await res2.json();
          const mappedCart = mapCartItemsFromServer(data2);
          setGroups((prev) => {
            const idx = prev.findIndex((g) => g.id === currentGroupId);
            if (idx >= 0) {
              const updated = { ...prev[idx], cart: mappedCart };
              return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
            }
            return prev;
          });
          logAPI(`/groups/${currentGroupId}/cart`, 'success', { count: mappedCart.length });
        }
      } catch (e) {
        logAPI(`/groups/${currentGroupId}/cart`, 'error', { error: String(e) });
      }
    };
    loadCurrentGroup();
  }, [currentGroupId]);

  const setCart = useCallback(
    (items: CartItem[]) => {
      if (!currentGroupId) return;
      setGroups((prev) => {
        const idx = prev.findIndex((g) => g.id === currentGroupId);
        if (idx >= 0) {
          const updated = { ...prev[idx], cart: items };
          return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
        }
        return prev;
      });
    },
    [currentGroupId]
  );

  const addToCart = useCallback(
    (item: CartItem) => {
      setCart([...cart, item]);
      // Attempt server persistence on add (best-effort)
      if (!currentGroupId) return;
      const base = getApiBase();
      (async () => {
        try {
          const payload = {
            progressItem: {
              type: item.type,
              baseItemId: item.item.id,
              assignedTo: item.assignedTo ?? null,
              groupId: currentGroupId,
            },
            quantity: item.quantity,
          };
          const res = await fetch(`${base}/groups/${currentGroupId}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            // Keep local state; server persistence not guaranteed for all operations
          }
        } catch {}
      })();
    },
    [cart, currentGroupId, setCart]
  );

  const updateCartQuantity = useCallback(
    (itemId: string, qty: number) => {
      setCart(cart.map((ci) => (ci.id === itemId ? { ...ci, quantity: qty } : ci)));
    },
    [cart, setCart]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      setCart(cart.filter((ci) => ci.id !== itemId));
    },
    [cart, setCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  // Navigation API
  const navigateToLanding = useCallback(() => {
    setCurrentPage('landing');
    setAppState({ currentPage: 'landing' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToMenu = useCallback(() => {
    setCurrentPage('menu');
    setAppState({ currentPage: 'menu' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToCart = useCallback(() => {
    setCurrentPage('cart');
    setAppState({ currentPage: 'cart' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToGroups = useCallback(() => {
    setCurrentPage('groups');
    setAppState({ currentPage: 'groups' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToCoffeeDetail = useCallback((
    coffeeId: string,
    initialCustomizations?: CoffeeCustomization,
    onSave?: (customizations: CoffeeCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => {
    setCurrentPage('coffee-detail');
    setAppState({
      currentPage: 'coffee-detail',
      selectedItemId: coffeeId,
      initialCoffeeCustomizations: initialCustomizations,
      onSaveCoffeeCustomizations: onSave,
    });
    setCoffeeCustomizationState(initialCustomizations || { milk: 'Whole Milk', syrups: [] });
    setIsMobileMenuOpen(false);
    setReturnToPage(returnTo);
  }, []);

  const navigateToPastryDetail = useCallback((
    pastryId: string,
    initialCustomizations?: PastryCustomization,
    onSave?: (customizations: PastryCustomization) => void,
    returnTo?: 'cart' | 'favorites'
  ) => {
    setCurrentPage('pastry-detail');
    setAppState({
      currentPage: 'pastry-detail',
      selectedItemId: pastryId,
      initialPastryCustomizations: initialCustomizations,
      onSavePastryCustomizations: onSave,
    });
    setPastryCustomizationState(initialCustomizations || { removedIngredients: [] });
    setIsMobileMenuOpen(false);
    setReturnToPage(returnTo);
  }, []);

  // Customization actions (coffee)
  const setCoffeeCustomization = useCallback((c: CoffeeCustomization) => {
    setCoffeeCustomizationState(c);
  }, []);

  const setCoffeeMilk = useCallback((milk: string) => {
    setCoffeeCustomizationState((prev) => ({ ...prev, milk }));
  }, []);

  const addCoffeeSyrup = useCallback((flavor: string) => {
    setCoffeeCustomizationState((prev) => {
      const existing = prev.syrups.find((s) => s.flavor === flavor);
      if (existing) {
        return {
          ...prev,
          syrups: prev.syrups.map((s) => (s.flavor === flavor ? { ...s, pumps: s.pumps + 1 } : s)),
        };
      }
      return { ...prev, syrups: [...prev.syrups, { flavor, pumps: 1 }] };
    });
  }, []);

  const updateCoffeeSyrupPumps = useCallback((flavor: string, pumps: number) => {
    setCoffeeCustomizationState((prev) => {
      if (pumps <= 0) {
        return { ...prev, syrups: prev.syrups.filter((s) => s.flavor !== flavor) };
      }
      return {
        ...prev,
        syrups: prev.syrups.map((s) => (s.flavor === flavor ? { ...s, pumps } : s)),
      };
    });
  }, []);

  const removeCoffeeSyrup = useCallback((flavor: string) => {
    setCoffeeCustomizationState((prev) => ({
      ...prev,
      syrups: prev.syrups.filter((s) => s.flavor !== flavor),
    }));
  }, []);

  const resetCoffeeCustomization = useCallback(() => {
    setCoffeeCustomizationState({ milk: 'Whole Milk', syrups: [] });
  }, []);

  // Customization actions (pastry)
  const setPastryCustomization = useCallback((c: PastryCustomization) => {
    setPastryCustomizationState(c);
  }, []);

  const togglePastryIngredient = useCallback((ingredient: string) => {
    setPastryCustomizationState((prev) => {
      const isRemoved = prev.removedIngredients.includes(ingredient);
      return {
        ...prev,
        removedIngredients: isRemoved
          ? prev.removedIngredients.filter((i) => i !== ingredient)
          : [...prev.removedIngredients, ingredient],
      };
    });
  }, []);

  const resetPastryCustomization = useCallback(() => {
    setPastryCustomizationState({ removedIngredients: [] });
  }, []);

  // Keep customization state in sync when page changes
  useEffect(() => {
    if (currentPage === 'coffee-detail') {
      setCoffeeCustomizationState(appState.initialCoffeeCustomizations || { milk: 'Whole Milk', syrups: [] });
    } else if (currentPage === 'pastry-detail') {
      setPastryCustomizationState(appState.initialPastryCustomizations || { removedIngredients: [] });
    }
  }, [currentPage, appState.initialCoffeeCustomizations, appState.initialPastryCustomizations]);

  const navigateToCheckout = useCallback(() => {
    setCurrentPage('checkout');
    setAppState({ currentPage: 'checkout' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToOrderHistory = useCallback(() => {
    setCurrentPage('order-history');
    setAppState({ currentPage: 'order-history' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateToFavorites = useCallback(() => {
    setCurrentPage('favorites');
    setAppState({ currentPage: 'favorites' });
    setIsMobileMenuOpen(false);
    setReturnToPage(undefined);
  }, []);

  const navigateBack = useCallback(() => {
    if (returnToPage === 'cart') navigateToCart();
    else if (returnToPage === 'favorites') navigateToFavorites();
    else navigateToMenu();
  }, [returnToPage, navigateToCart, navigateToFavorites, navigateToMenu]);

  // Favorites API
  const addToFavorites = useCallback((favorite: FavoriteItem) => {
    setFavorites((prev) => [...prev, favorite]);
  }, []);

  const removeFromFavorites = useCallback((favoriteId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
  }, []);

  const updateFavorite = useCallback((favoriteId: string, updates: Partial<FavoriteItem>) => {
    setFavorites((prev) => prev.map((fav) => (fav.id === favoriteId ? { ...fav, ...updates, dateAdded: new Date() } : fav)));
  }, []);

  const getGroupFavorites = useCallback(
    (groupId: string) => {
      return favorites.filter((fav) => {
        if (!fav.assignedTo && fav.groupId === groupId) return true;
        if (fav.assignedTo) {
          const group = groups.find((g) => g.id === groupId);
          return group?.members.some((m) => m.name === fav.assignedTo);
        }
        return false;
      });
    },
    [favorites, groups]
  );

  const getMemberFavorites = useCallback(
    (memberName: string) => favorites.filter((fav) => fav.assignedTo === memberName),
    [favorites]
  );

  const cleanupMemberFavorites = useCallback((memberName: string, groupId: string) => {
    setFavorites((prev) =>
      prev.filter((fav) => {
        if (fav.assignedTo === memberName) return true;
        return !(fav.groupId === groupId && !fav.assignedTo);
      })
    );
  }, []);

  const transferMemberFavorites = useCallback((_memberName: string, _fromGroupId: string, _toGroupId: string) => {
    // No-op for now; favorites are derived
  }, []);

  const isItemFavorited = useCallback(
    (
      type: 'coffee' | 'pastry',
      itemId: string,
      groupId: string,
      customizations?: CoffeeCustomization | PastryCustomization,
      assignedTo?: string
    ) => {
      const normalized =
        customizations || (type === 'coffee' ? ({ syrups: [], milk: 'Whole Milk' } as CoffeeCustomization) : ({ removedIngredients: [] } as PastryCustomization));
      return favorites.some(
        (fav) =>
          fav.type === type &&
          fav.item.id === itemId &&
          fav.groupId === groupId &&
          JSON.stringify(fav.customizations) === JSON.stringify(normalized) &&
          fav.assignedTo === assignedTo
      );
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (
      type: 'coffee' | 'pastry',
      item: any,
      groupId: string,
      customizations?: CoffeeCustomization | PastryCustomization,
      assignedTo?: string
    ) => {
      const normalized =
        customizations || (type === 'coffee' ? ({ syrups: [], milk: 'Whole Milk' } as CoffeeCustomization) : ({ removedIngredients: [] } as PastryCustomization));
      const existing = favorites.find(
        (fav) =>
          fav.type === type &&
          fav.item.id === item.id &&
          fav.groupId === groupId &&
          JSON.stringify(fav.customizations) === JSON.stringify(normalized) &&
          fav.assignedTo === assignedTo
      );
      if (existing) removeFromFavorites(existing.id);
      else addToFavorites({ id: crypto.randomUUID(), item, type, customizations: normalized, dateAdded: new Date(), assignedTo, groupId });
    },
    [favorites, addToFavorites, removeFromFavorites]
  );

  const resetFavorites = useCallback(() => setFavorites([]), []);

  const addCartSetToFavorites = useCallback((name: string, cartItems: CartItem[], groupId: string) => {
    const totalAmount = cartItems.reduce((total, item) => total + item.item.price * item.quantity, 0);
    const newSet: CartSetFavorite = { id: crypto.randomUUID(), name, items: cartItems.map((i) => ({ ...i })), dateAdded: new Date(), groupId, totalAmount };
    setCartSetFavorites((prev) => [...prev, newSet]);
  }, []);

  const removeCartSetFromFavorites = useCallback((cartSetId: string) => {
    setCartSetFavorites((prev) => prev.filter((s) => s.id !== cartSetId));
  }, []);

  const getGroupCartSetFavorites = useCallback((groupId: string) => cartSetFavorites.filter((s) => s.groupId === groupId), [cartSetFavorites]);

  const updateCartSetName = useCallback((cartSetId: string, newName: string) => {
    setCartSetFavorites((prev) => prev.map((s) => (s.id === cartSetId ? { ...s, name: newName } : s)));
  }, []);

  const value: AppContextValue = {
    currentGroupId,
    setCurrentGroupId,
    currentPage,
    setCurrentPage,
    appState,
    setAppState,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    returnToPage,
    setReturnToPage,
    groups,
    loading,
    error,
    currentGroup,
    cart,
    members,
    setCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    coffeeCustomization,
    setCoffeeCustomization,
    setCoffeeMilk,
    addCoffeeSyrup,
    updateCoffeeSyrupPumps,
    removeCoffeeSyrup,
    resetCoffeeCustomization,
    pastryCustomization,
    setPastryCustomization,
    togglePastryIngredient,
    resetPastryCustomization,
    navigateToLanding,
    navigateToMenu,
    navigateToCart,
    navigateToGroups,
    navigateToCoffeeDetail,
    navigateToPastryDetail,
    navigateToCheckout,
    navigateToOrderHistory,
    navigateToFavorites,
    navigateBack,
    favorites,
    cartSetFavorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    getGroupFavorites,
    getMemberFavorites,
    cleanupMemberFavorites,
    transferMemberFavorites,
    isItemFavorited,
    toggleFavorite,
    resetFavorites,
    addCartSetToFavorites,
    removeCartSetFromFavorites,
    getGroupCartSetFavorites,
    updateCartSetName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
};

export const useCurrentGroup = () => {
  const { currentGroup, setCurrentGroupId } = useAppContext();
  return {
    currentGroup,
    setCurrentGroup: setCurrentGroupId,
  };
};

export const useCart = () => {
  const { cart, setCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = useAppContext();
  return { cart, setCart, addToCart, updateCartQuantity, removeFromCart, clearCart };
};