import { Schema, model, InferSchemaType } from 'mongoose';

/** ---------------- Allergen Groups ---------------- */
export const AllergenGroupSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  allergens: { type: [String], default: [] },
  icon: { type: String },
}, { collection: 'allergen_groups', timestamps: false });

export const AllergenGroupModel = model('AllergenGroup', AllergenGroupSchema);
export type AllergenGroupDoc = InferSchemaType<typeof AllergenGroupSchema>;

/** ---------------- Individual Allergens ---------------- */
export const IndividualAllergenSchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { collection: 'individual_allergens', timestamps: false });

export const IndividualAllergenModel = model('IndividualAllergen', IndividualAllergenSchema);
export type IndividualAllergenDoc = InferSchemaType<typeof IndividualAllergenSchema>;