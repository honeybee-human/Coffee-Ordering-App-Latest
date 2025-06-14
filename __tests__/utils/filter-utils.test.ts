import { isWordStartMatch, filterItems } from '@/utils/filter-utils';
import { getComprehensiveAllergens } from '@/utils/allergens';

// Mock the getComprehensiveAllergens function
jest.mock('@/utils/allergens', () => ({
  getComprehensiveAllergens: jest.fn().mockImplementation((item) => item.allergens || [])
}));

describe('isWordStartMatch', () => {
  it('returns true when search query is empty', () => {
    expect(isWordStartMatch('', 'Coffee')).toBe(true);
    expect(isWordStartMatch('  ', 'Coffee')).toBe(true);
  });

  it('returns true when target text starts with search query', () => {
    expect(isWordStartMatch('cof', 'Coffee')).toBe(true);
    expect(isWordStartMatch('COF', 'coffee')).toBe(true); // Case insensitive
  });

  it('returns true when any word in target text starts with search query', () => {
    expect(isWordStartMatch('lat', 'Iced Latte')).toBe(true);
    expect(isWordStartMatch('ic', 'Vanilla Iced Coffee')).toBe(true);
  });

  it('returns false when no word in target text starts with search query', () => {
    expect(isWordStartMatch('moc', 'Latte')).toBe(false);
    expect(isWordStartMatch('van', 'Chocolate Mocha')).toBe(false);
  });
});

describe('filterItems', () => {
  const testItems = [
    { name: 'Coffee', description: 'Hot beverage', allergens: ['Dairy'] },
    { name: 'Latte', description: 'Coffee with milk', allergens: ['Dairy', 'Nuts'] },
    { name: 'Croissant', description: 'Buttery pastry', allergens: ['Gluten', 'Dairy'] },
    { name: 'Muffin', description: 'Blueberry treat', allergens: ['Gluten', 'Eggs'] }
  ];

  it('returns all items when search query is empty and no allergens excluded', () => {
    const result = filterItems({
      items: testItems,
      searchQuery: '',
      searchMode: 'name',
      excludedAllergens: []
    });

    expect(result).toHaveLength(4);
    expect(result).toEqual(testItems);
  });

  it('filters items by name', () => {
    const result = filterItems({
      items: testItems,
      searchQuery: 'cof',
      searchMode: 'name',
      excludedAllergens: []
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Coffee');
  });

  it('filters items by description', () => {
    const result = filterItems({
      items: testItems,
      searchQuery: 'milk',
      searchMode: 'description',
      excludedAllergens: []
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Latte');
  });

  it('filters items by excluded allergens', () => {
    const result = filterItems({
      items: testItems,
      searchQuery: '',
      searchMode: 'name',
      excludedAllergens: ['Nuts']
    });

    expect(result).toHaveLength(3);
    expect(result.map(item => item.name)).toEqual(['Coffee', 'Croissant', 'Muffin']);
  });

  it('combines search and allergen filtering', () => {
    const result = filterItems({
      items: testItems,
      searchQuery: 'b',
      searchMode: 'description',
      excludedAllergens: ['Gluten']
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Coffee');
  });
});