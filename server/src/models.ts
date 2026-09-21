import mongoose, { Schema } from 'mongoose';

const memberSchema = new Schema(
  {
    name: { type: String, required: true },
    allergens: { type: [String], default: [] }
  },
  { _id: false }
);

const groupSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    members: { type: [memberSchema], default: [] },
    cart: { type: [Schema.Types.Mixed], default: [] },
    dateCreated: { type: Date, default: Date.now },
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const favoriteSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    item: { type: Schema.Types.Mixed },
    customizations: { type: Schema.Types.Mixed },
    dateAdded: { type: Date, default: Date.now },
    assignedTo: { type: String },
    groupId: { type: String, required: true },
    cartItems: { type: [Schema.Types.Mixed] },
    customName: { type: String }
  },
  { timestamps: true }
);

const cartSetFavoriteSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    items: { type: [Schema.Types.Mixed], default: [] },
    dateAdded: { type: Date, default: Date.now },
    groupId: { type: String, required: true },
    totalAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    items: { type: [Schema.Types.Mixed], default: [] },
    orderNumber: { type: String, required: true },
    groupId: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'completed'],
      default: 'pending'
    },
    groupMembers: { type: [memberSchema], default: [] },
    estimatedTime: { type: Number },
    groupName: { type: String },
    paymentInfo: { type: Schema.Types.Mixed },
    isBookmarked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const menuItemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['coffee', 'pastry'], required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    allergens: { type: [String], default: [] },
    description: { type: String },
    image: { type: String },
    ingredients: { type: [String] },
    removableIngredients: { type: [String] }
  },
  { timestamps: true }
);

const allergenSettingsSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    excludedAllergens: { type: [String], default: [] },
    autoFilterEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const appMetaSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    activeGroupId: { type: String, default: null },
    allMembers: { type: [memberSchema], default: [] }
  },
  { timestamps: true }
);

export const GroupModel = mongoose.models.Group || mongoose.model('Group', groupSchema);
export const FavoriteModel = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
export const CartSetFavoriteModel =
  mongoose.models.CartSetFavorite || mongoose.model('CartSetFavorite', cartSetFavoriteSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const MenuItemModel = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export const AllergenSettingsModel =
  mongoose.models.AllergenSettings || mongoose.model('AllergenSettings', allergenSettingsSchema);
export const AppMetaModel = mongoose.models.AppMeta || mongoose.model('AppMeta', appMetaSchema);
