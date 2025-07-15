import React from 'react';
import { CartItem, FavoriteItem } from '@/types';
import {
  formatCustomizations,
  formatFavoriteCustomizations,
  chunkArray,
} from '@/utils/formatting-utils';
type Props =
  | { item: CartItem; favorite?: never }
  | { favorite: FavoriteItem; item?: never };

const CustomizationsList: React.FC<Props> = ({ item, favorite }) => {
  const lines = item
    ? formatCustomizations(item)
    : favorite
    ? formatFavoriteCustomizations(favorite)
    : [];

  const columns = chunkArray(lines, 4);

  if (columns.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 mt-2">
      {columns.map((column, colIndex) => (
        <ul key={colIndex} className="flex-1 min-w-[120px] space-y-1 text-sm text-muted-foreground">
          {column.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ))}
    </div>
  );
};

export default CustomizationsList;
