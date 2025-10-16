import { Schema, model, InferSchemaType } from 'mongoose';
import { CartItemSchema } from './item';

/** ---------------- Groups & Members ---------------- */
export const GroupMemberSchema = new Schema({
  name: { type: String, required: true },
  allergens: { type: [String], default: [] },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
});

export const GroupMemberModel = model('GroupMember', GroupMemberSchema);
export type GroupMemberDoc = InferSchemaType<typeof GroupMemberSchema>;

export const GroupSchema = new Schema({
  name: { type: String, required: true },
  cart: { type: [CartItemSchema], default: [] },
  dateCreated: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false },
});

export const GroupModel = model('Group', GroupSchema);
export type GroupDoc = InferSchemaType<typeof GroupSchema>;