// Seed database based on client/data/menu.ts and allergenGroups.ts
// This script is idempotent: it checks collections before inserting.

(function () {
  const dbName = 'coffeeapp';
  const conn = new Mongo();
  const database = conn.getDB(dbName);

  // Collections
  const itemsCol = database.getCollection('items');
  const allergenGroupsCol = database.getCollection('allergen_groups');
  const individualAllergensCol = database.getCollection('individual_allergens');

  // Optional reset flag: pass with mongosh --eval "var RESET_SEED=true"
  const shouldDrop = (typeof RESET_SEED !== 'undefined' && RESET_SEED === true);
  if (shouldDrop) {
    [itemsCol, allergenGroupsCol, individualAllergensCol].forEach(col => {
      try {
        if (col.exists()) {
          col.drop();
          print(`Dropped '${dbName}.${col.getName()}'.`);
        }
      } catch (e) {
        print(`Skip drop '${dbName}.${col.getName()}': ${e && e.message ? e.message : e}`);
      }
    });
  }

  // Shared customization options (from client/data/menu.ts)
  const syrupOptions = [
    'Vanilla',
    'Caramel',
    'Hazelnut',
    'Cinnamon',
    'Peppermint',
    'Chocolate',
    'Maple',
    'Irish Cream',
  ];

  // Coffee menu items
  const coffeeItems = [
    {
      type: 'coffee',
      name: 'Espresso',
      price: 2.5,
      allergens: [],
      description: 'Rich, bold shot of pure coffee perfection',
      image: '/Espresso.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Americano',
      price: 3.0,
      allergens: [],
      description: 'Espresso with hot water for a clean, strong flavor',
      image: '/Americano.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Latte',
      price: 4.5,
      allergens: ['Milk'],
      description: 'Smooth espresso with steamed milk and a light foam layer',
      image: '/Latte.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Cappuccino',
      price: 4.25,
      allergens: ['Milk'],
      description: 'Equal parts espresso, steamed milk, and rich foam',
      image: '/Capuccino.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Macchiato',
      price: 4.75,
      allergens: ['Milk'],
      description: 'Espresso "marked" with a dollop of foamed milk',
      image: '/Macchiato.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Mocha',
      price: 5.0,
      allergens: ['Milk', 'Soy'],
      description: 'Rich chocolate and espresso blend with steamed milk',
      image: '/Mocha.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Flat White',
      price: 4.75,
      allergens: ['Milk'],
      description: 'Strong espresso with microfoam steamed milk',
      image: '/Flat White.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Cold Brew',
      price: 3.75,
      allergens: [],
      description: 'Smooth, less acidic coffee steeped in cold water',
      image: '/Cold Brew.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
    {
      type: 'coffee',
      name: 'Frappuccino',
      price: 5.5,
      allergens: ['Soy'],
      description: 'Blended coffee drink with ice, , and flavored syrups',
      image: '/Frappucino.png',
      syrupOptions,
      defaultMilk: 'Whole Milk',
    },
  ];

  // Pastry menu items
  const pastryItems = [
    {
      type: 'pastry',
      name: 'Butter Croissant',
      price: 3.25,
      allergens: ['Gluten', 'Eggs'],
      ingredients: ['Wheat flour', 'Butter', 'Eggs', 'Yeast', 'Salt', 'Sugar'],
      removableIngredients: ['Butter glaze'],
      description: 'Flaky, buttery French pastry perfect with coffee',
      image: '/Butter Croissant.png',
    },
    {
      type: 'pastry',
      name: 'Chocolate Croissant',
      price: 3.75,
      allergens: ['Eggs', 'Soy'],
      ingredients: ['Wheat flour', 'Butter', 'Eggs', 'Dark chocolate', 'Soy lecithin', 'Yeast', 'Salt', 'Sugar'],
      removableIngredients: ['Chocolate filling'],
      description: 'Buttery croissant filled with rich dark chocolate',
      image: '/Chocolate Croissant.png',
    },
    {
      type: 'pastry',
      name: 'Blueberry Muffin',
      price: 2.95,
      allergens: ['Eggs'],
      ingredients: ['Wheat flour', 'Blueberries', 'Eggs', 'Butter', 'Sugar', 'Baking powder', 'Vanilla', 'Lemon zest'],
      removableIngredients: ['Sugar topping', 'Lemon zest'],
      description: 'Moist muffin bursting with fresh blueberries',
      image: '/Blueberry Muffin.png',
    },
    {
      type: 'pastry',
      name: 'Banana Bread',
      price: 3.5,
      allergens: ['Gluten', 'Walnuts'],
      ingredients: ['Wheat flour', 'Ripe bananas', 'Walnuts', 'Butter', 'Sugar', 'Baking soda', 'Vanilla'],
      removableIngredients: ['Walnuts'],
      description: 'Sweet, moist bread made with ripe bananas and walnuts',
      image: '/Banana Bread.png',
    },
    {
      type: 'pastry',
      name: 'Cranberry Scone',
      price: 3.25,
      allergens: ['Pecans'],
      ingredients: ['Wheat flour', 'Pecans', 'Hazelnuts', 'Dried cranberries', 'Butter', 'Sugar', 'Baking powder', 'Orange zest', 'Salt'],
      removableIngredients: ['Cranberries', 'Orange zest', 'Sugar glaze'],
      description: 'Traditional British scone with tart cranberries',
      image: '/Cranberry Scone.png',
    },
    {
      type: 'pastry',
      name: 'Cheese Danish',
      price: 3.95,
      allergens: ['Milk', 'Cheese'],
      ingredients: ['Wheat flour', 'Cheese', 'Sugar', 'Yeast', 'Vanilla', 'Fruit preserves'],
      removableIngredients: ['Cream cheese filling', 'Fruit topping'],
      description: 'Flaky pastry filled with sweet cream cheese',
      image: '/Cheese Danish.png',
    },
    {
      type: 'pastry',
      name: 'Everything Bagel',
      price: 2.5,
      allergens: ['Gluten', 'Sesame'],
      ingredients: ['Wheat flour', 'Sesame seeds', 'Poppy seeds', 'Dried garlic', 'Dried onion', 'Salt', 'Yeast', 'Water'],
      removableIngredients: ['Everything seasoning', 'Sesame seeds', 'Poppy seeds'],
      description: 'Classic bagel topped with savory everything seasoning',
      image: '/Everything Bagel.png',
    },
    {
      type: 'pastry',
      name: 'Cinnamon Roll',
      price: 4.25,
      allergens: ['Milk', 'Almonds'],
      ingredients: ['Wheat flour', 'Cinnamon', 'Almonds', 'Butter', 'Sugar', 'Yeast', 'Vanilla', 'Powdered sugar'],
      removableIngredients: ['Cinnamon filling', 'Icing', 'Pecans', 'Almonds'],
      description: 'Warm, gooey roll with cinnamon, nuts, and sweet icing',
      image: '/Cinnamon Roll.png',
    },
  ];

  // Allergen groups (from client/data/allergenGroups.ts)
  const allergenGroups = [
    {
      id: 'tree-nuts',
      name: 'Tree Nuts',
      description: 'All tree nuts including almonds, walnuts, pecans, etc.',
      allergens: ['Almonds', 'Brazil Nuts', 'Cashews', 'Chestnuts', 'Hazelnuts', 'Macadamias', 'Pecans', 'Pine Nuts', 'Pistachios', 'Walnuts'],
      icon: '🥜',
    },
    {
      id: 'fruits',
      name: 'Fruits',
      description: 'All fruits including berries, citrus, stone fruits, etc.',
      allergens: ['Apples', 'Bananas', 'Citrus', 'Grapes', 'Strawberries'],
      icon: '🍎',
    },
    {
      id: 'berries',
      name: 'Berries',
      description: 'All berries including strawberries, blueberries, raspberries, etc.',
      allergens: ['Blueberries', 'Blackberries', 'Cranberries', 'Raspberries', 'Strawberries'],
      icon: '🫐',
    },
    {
      id: 'citrus',
      name: 'Citrus Fruits',
      description: 'Citrus fruits like oranges, lemons, limes',
      allergens: ['Oranges', 'Lemons', 'Limes', 'Grapefruits'],
      icon: '🍊',
    },
    {
      id: 'dairy',
      name: 'Dairy Products',
      description: 'All dairy and milk-based products',
      allergens: ['Milk', 'Cheese', 'Butter', 'Cream', 'Yogurt', 'Whey', 'Casein', 'Lactose'],
      icon: '🥛',
    },
    {
      id: 'gluten-grains',
      name: 'Gluten-Containing Grains',
      description: 'Grains that contain gluten',
      allergens: ['Wheat', 'Barley', 'Rye', 'Gluten'],
      icon: '🌾',
    },
    {
      id: 'all-grains',
      name: 'All Grains',
      description: 'All grains including gluten-free options',
      allergens: ['Wheat', 'Barley', 'Rye', 'Oats', 'Corn', 'Rice', 'Gluten'],
      icon: '🌾',
    },
    {
      id: 'seafood',
      name: 'Seafood',
      description: 'All fish and shellfish',
      allergens: ['Fish', 'Shellfish', 'Molluscs'],
      icon: '🐟',
    },
    {
      id: 'spices',
      name: 'Spices & Seasonings',
      description: 'Common spices and seasonings',
      allergens: ['Vanilla', 'Cinnamon', 'Ginger', 'Garlic', 'Onions', 'Peppers', 'Mustard', 'Celery'],
      icon: '🌶️',
    },
    {
      id: 'artificial-additives',
      name: 'Artificial Additives',
      description: 'Artificial colors, flavors, and preservatives',
      allergens: ['Artificial Colors', 'Artificial Flavors', 'Preservatives', 'MSG', 'Aspartame', 'Carrageenan'],
      icon: '🧪',
    },
    {
      id: 'sweeteners',
      name: 'Natural Sweeteners',
      description: 'Natural sweetening agents',
      allergens: ['Honey', 'Maple'],
      icon: '🍯',
    },
  ];

  const individualAllergens = [
    'Eggs',
    'Peanuts',
    'Soy',
    'Sesame',
    'Tomatoes',
    'Latex',
    'Caffeine',
    'Chocolate',
    'Yeast',
    'Sulphites',
    'Lupin',
  ];

  // Insert menu items if not present
  if (itemsCol.countDocuments({}) === 0) {
    itemsCol.insertMany([...coffeeItems, ...pastryItems]);
    print(`Inserted ${coffeeItems.length + pastryItems.length} items into '${dbName}.items'.`);
  } else {
    print(`Skipping items seed: '${dbName}.items' already has data.`);
  }

  // Insert allergen groups if not present
  if (allergenGroupsCol.countDocuments({}) === 0) {
    allergenGroupsCol.insertMany(allergenGroups);
    print(`Inserted ${allergenGroups.length} allergen groups into '${dbName}.allergen_groups'.`);
  } else {
    print(`Skipping allergen groups seed: '${dbName}.allergen_groups' already has data.`);
  }

  // Insert individual allergens if not present
  if (individualAllergensCol.countDocuments({}) === 0) {
    individualAllergensCol.insertMany(individualAllergens.map(name => ({ name })));
    print(`Inserted ${individualAllergens.length} individual allergens into '${dbName}.individual_allergens'.`);
  } else {
    print(`Skipping individual allergens seed: '${dbName}.individual_allergens' already has data.`);
  }
})();