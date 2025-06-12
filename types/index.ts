export interface Coffee {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  description?: string;
  image?: string;
}

export interface Pastry {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  removableIngredients: string[];
  description?: string;
  image?: string;
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
  assignedTo?: string;
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
  orderNumber: string;
  groupId: string;
  totalAmount: number;
  orderDate: Date;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  groupMembers: GroupMember[];
  estimatedTime?: number; // in minutes
  groupName?: string;
  paymentInfo?:PaymentInfo;
}

export interface FavoriteItem {
  id: string;
  type: 'coffee' | 'pastry';
  item: Coffee | Pastry;
  customizations: CoffeeCustomization | PastryCustomization;
  dateAdded: Date;
  assignedTo?: string;
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
  initialPastryCustomizations?: PastryCustomization;
  initialCoffeeCustomizations?: CoffeeCustomization;

}

export interface ModalState {
  allergenWarning: {
    isOpen: boolean;
    itemId: string;
    itemType: 'coffee' | 'pastry';
    allergens: string[];
  };
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