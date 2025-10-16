

// Client-side type re-exports to avoid bundling mongoose in the frontend.
// These types are exported from server Mongoose schemas to keep consistency.
export type {
  ItemDoc as DBItem,
  ProgressItemDoc as DBProgressItem,
  CartItemDoc as DBCartItem,
  FavoriteItemDoc as DBFavoriteItem,
} from '@server/models';