export interface Coffee {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  description?: string;
}

export interface Pastry {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  removableIngredients: string[];
  description?: string;
}

export interface CoffeeCustomization {
  syrups: { flavor: string; pumps: number }[];
  milk: string;
}

export interface PastryCustomization {
  removedIngredients: string[];
}

export interface CartItem {
  id: string;
  type: 'coffee' | 'pastry';
  item: Coffee | Pastry;
  customizations: CoffeeCustomization | PastryCustomization;
  quantity: number;
  forPerson?: string;
}

export interface GroupMember {
  name: string;
  allergens: string[];
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  cart: CartItem[];
  dateCreated: Date;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  orderDate: Date;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  groupMembers: GroupMember[];
  paymentMethod: string;
  estimatedTime?: number; // in minutes
  groupName?: string;
}

export interface FavoriteItem {
  id: string;
  type: 'coffee' | 'pastry';
  item: Coffee | Pastry;
  customizations: CoffeeCustomization | PastryCustomization;
  dateAdded: Date;
}

export interface AppData {
  groups: Group[];
  activeGroupId: string | null;
  orderHistory: Order[];
  favorites: FavoriteItem[];
}

export type PageType = 'menu' | 'coffee-detail' | 'pastry-detail' | 'cart' | 'checkout' | 'order-history' | 'favorites' | 'groups';

export interface AppState {
  currentPage: PageType;
  selectedItemId?: string;
  initialCustomizations?: CoffeeCustomization | PastryCustomization;
}

export interface ModalState {
  addToCart: {
    isOpen: boolean;
    itemName: string;
  };
  orderComplete: {
    isOpen: boolean;
    orderNumber: string;
    estimatedTime: number;
  };
}