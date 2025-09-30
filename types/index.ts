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
  ingredients?: string[];
  removableIngredients: string[];
  description?: string;
  image?: string;
}

export interface CoffeeCustomization {
  syrups: { flavor: string; pumps: number }[];
  milk: string;
  assignedTo?: string;
}

export interface PastryCustomization {
  removedIngredients: string[];
  assignedTo?: string;
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
  isFavorite?: boolean; // New property for favoriting groups
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
  paymentInfo?: PaymentInfo;
  isBookmarked?: boolean; // New field for bookmarking orders
}

export interface FavoriteItem {
  id: string;
  type: 'coffee' | 'pastry' | 'cart-set'; // Added 'cart-set' type
  item: Coffee | Pastry;
  customizations: CoffeeCustomization | PastryCustomization;
  dateAdded: Date;
  assignedTo?: string;
  groupId: string;
  // New fields for cart set favorites
  cartItems?: CartItem[]; // For cart-set type favorites
  customName?: string; // For personalized names like "My Workday Latte Set"
}

// New interface for cart set favorites
export interface CartSetFavorite {
  id: string;
  name: string; // Personalized name
  items: CartItem[];
  dateAdded: Date;
  groupId: string;
  totalAmount: number;
}

export interface AppData {
  groups: Group[];
  activeGroupId: string | null;
  orderHistory: Order[];
  favorites: FavoriteItem[];
}

export type PageType = 'landing' | 'menu' | 'coffee-detail' | 'pastry-detail' | 'cart' | 'checkout' | 'order-history' | 'favorites' | 'groups';

export interface AppState {
  currentPage: 'landing' | 'menu' | 'cart' | 'groups' | 'coffee-detail' | 'pastry-detail' | 'checkout' | 'order-history' | 'favorites';
  selectedItemId?: string;
  initialCoffeeCustomizations?: CoffeeCustomization;
  initialPastryCustomizations?: PastryCustomization;
  onSaveCoffeeCustomizations?: (customizations: CoffeeCustomization) => void;
  onSavePastryCustomizations?: (customizations: PastryCustomization) => void;
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


export interface AllergenGroup {
  id: string;
  name: string;
  description: string;
  allergens: string[];
  icon?: string;
}

export interface AllergenCollection {
  groups: AllergenGroup[];
  individualAllergens: string[];
}