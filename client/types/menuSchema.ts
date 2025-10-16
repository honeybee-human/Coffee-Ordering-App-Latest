// Client-side type re-exports to avoid bundling mongoose in the frontend.
// These types are exported from server Mongoose schemas to keep consistency.
export type {
  CoffeeDoc as DBCoffee,
  PastryDoc as DBPastry,
  CoffeeProgressDoc as DBCoffeeProgress,
  PastryProgressDoc as DBPastryProgress,
  CoffeeAdditions as DBCoffeeAdditions,
  PastryAdditions as DBPastryAdditions,
  CoffeeCustomizationAdditions as DBCoffeeCustomization,
  PastryCustomizationAdditions as DBPastryCustomization,
} from '@server/models';
