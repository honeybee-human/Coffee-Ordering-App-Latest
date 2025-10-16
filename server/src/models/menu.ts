import mongoose, { Schema, InferSchemaType } from 'mongoose';
import { ItemModel, ProgressItemModel } from './item';

/** ---------------- Menu Base Items ---------------- */
export const CoffeeSchema = new Schema({
  syrupOptions: [{ type: String }],
  defaultMilk: { type: String, default: 'whole' },
});
// Use unique model names to avoid global Mongoose model name clashes,
// while keeping discriminator value as 'coffee'
export const CoffeeModel =
  (mongoose.models.CoffeeItem as any) ||
  ItemModel.discriminator('CoffeeItem', CoffeeSchema, 'coffee');

export const PastrySchema = new Schema({
  ingredients: { type: [String], default: [] },
  removableIngredients: { type: [String], default: [] },
});
export const PastryModel =
  (mongoose.models.PastryItem as any) ||
  ItemModel.discriminator('PastryItem', PastrySchema, 'pastry');

/** ---------------- Menu Customizations ---------------- */
export const CoffeeCustomizationSchema = new Schema({
  syrups: [{ flavor: String, pumps: Number }],
  milk: { type: String },
});
export const CoffeeItemModel =
  (mongoose.models.CoffeeProgressItem as any) ||
  ProgressItemModel.discriminator('CoffeeProgressItem', CoffeeCustomizationSchema, 'coffee');

export const PastryCustomizationSchema = new Schema({
  removedIngredients: { type: [String], default: [] },
});
export const PastryItemModel =
  (mongoose.models.PastryProgressItem as any) ||
  ProgressItemModel.discriminator('PastryProgressItem', PastryCustomizationSchema, 'pastry');

// Type helpers
export type CoffeeAdditions = InferSchemaType<typeof CoffeeSchema>;
export type PastryAdditions = InferSchemaType<typeof PastrySchema>;
export type CoffeeCustomizationAdditions = InferSchemaType<typeof CoffeeCustomizationSchema>;
export type PastryCustomizationAdditions = InferSchemaType<typeof PastryCustomizationSchema>;

// Discriminator document types
import type { ItemDoc, ProgressItemDoc } from './item';
export type CoffeeDoc = ItemDoc & CoffeeAdditions;
export type PastryDoc = ItemDoc & PastryAdditions;
export type CoffeeProgressDoc = ProgressItemDoc & CoffeeCustomizationAdditions;
export type PastryProgressDoc = ProgressItemDoc & PastryCustomizationAdditions;