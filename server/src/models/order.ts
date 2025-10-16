import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

/** ---------------- Snapshot Base ---------------- */
export const SnapshotBaseSchema = new Schema({
  type: { type: String, enum: ['coffee', 'pastry'], required: true },
  baseItemId: { type: Schema.Types.ObjectId, required: true },
  assignedTo: { type: Schema.Types.ObjectId, default: null },
  groupId: { type: Schema.Types.ObjectId, default: null },
}, { discriminatorKey: 'type', _id: false });

/** ---------------- Snapshot Discriminators ---------------- */
export const SnapshotCoffeeSchema = new Schema({
  syrups: [{ flavor: String, pumps: Number }],
  milk: { type: String },
}, { _id: false });

export const SnapshotPastrySchema = new Schema({
  removedIngredients: { type: [String], default: [] },
}, { _id: false });

/** ---------------- Order Schema ---------------- */
export const OrderItemSchema = new Schema({
  snapshotItem: { type: SnapshotBaseSchema, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

export const OrderSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },

  members: [{
    _id: Schema.Types.ObjectId,
    name: String,
    allergens: [String],
  }],

  items: [OrderItemSchema],

  orderNumber: { type: String, required: true },
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed'],
    default: 'pending',
  },
  estimatedTime: Number,

  paymentInfo: {
    cardholderName: String,
    last4Digits: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
  },
  isBookmarked: { type: Boolean, default: false },
});

export const OrderModel = model('Order', OrderSchema);

// attach discriminators after model creation
// TypeScript doesn't recognize discriminator on SchemaType path; cast for correctness.
(OrderItemSchema.path('snapshotItem') as any).discriminator('coffee', SnapshotCoffeeSchema);
(OrderItemSchema.path('snapshotItem') as any).discriminator('pastry', SnapshotPastrySchema);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;