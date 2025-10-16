import { Schema, InferSchemaType, model } from 'mongoose';

/** ---------------- Base Item Type ---------------- */
export const BaseItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  allergens: { type: [String], default: [] },
  description: { type: String },
  image: { type: String },
}, { discriminatorKey: 'type', timestamps: true });

export const ItemModel = model('Item', BaseItemSchema);
export type ItemDoc = InferSchemaType<typeof BaseItemSchema>;

/** ---------------- Customized Item in Progress Type ---------------- */
export const ProgressItemSchema = new Schema({
  type: { type: String, enum: ['coffee', 'pastry'], required: true },
  baseItemId: { type: Schema.Types.ObjectId, required: true, refPath: 'type' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'GroupMember', default: null },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
}, { discriminatorKey: 'type', timestamps: true });

export const ProgressItemModel = model('ProgressItem', ProgressItemSchema);
export type ProgressItemDoc = InferSchemaType<typeof ProgressItemSchema>;

/** ---------------- Cart & Favorites ---------------- */
export const CartItemSchema = new Schema({
  progressItem: { type: ProgressItemSchema, required: true },
  quantity: { type: Number, default: 1 },
});

export const CartItemModel = model('CartItem', CartItemSchema);
export type CartItemDoc = InferSchemaType<typeof CartItemSchema>;

export const FavoriteItemSchema = new Schema({
  progressItem: { type: ProgressItemSchema, required: true },
  name: { type: String },
  dateAdded: { type: Date, default: Date.now },
});

export const FavoriteItemModel = model('FavoriteItem', FavoriteItemSchema);
export type FavoriteItemDoc = InferSchemaType<typeof FavoriteItemSchema>;