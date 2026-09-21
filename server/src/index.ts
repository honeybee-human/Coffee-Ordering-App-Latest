import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectMongo, mongoReady } from './db';
import {
  AllergenSettingsModel,
  AppMetaModel,
  CartSetFavoriteModel,
  FavoriteModel,
  GroupModel,
  MenuItemModel,
  OrderModel
} from './models';
import { sanitizeOrder } from './sanitize';
import { createDefaultGroup, defaultMember, ensureDefaultAppState, seedMenu } from './seed';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safeplate';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

async function getMenu() {
  const items = await MenuItemModel.find().lean();
  const coffee = items.filter((item) => item.kind === 'coffee').map(({ kind: _kind, ...rest }) => {
    void _kind;
    return rest;
  });
  const pastry = items.filter((item) => item.kind === 'pastry').map(({ kind: _kind, ...rest }) => {
    void _kind;
    return rest;
  });
  return { coffee, pastry };
}

async function getGroupsPayload() {
  const groups = await GroupModel.find().lean();
  const meta = await AppMetaModel.findOne({ key: 'default' }).lean();
  return {
    groups: groups.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    activeGroupId: meta?.activeGroupId ?? null,
    allMembers: meta?.allMembers ?? []
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: mongoReady() });
});

app.get('/api/menu', async (_req, res) => {
  res.json(await getMenu());
});

app.get('/api/groups', async (_req, res) => {
  res.json(await getGroupsPayload());
});

app.put('/api/groups', async (req, res) => {
  const { groups = [], activeGroupId = null, allMembers = [] } = req.body || {};
  await GroupModel.deleteMany({});
  if (Array.isArray(groups) && groups.length > 0) {
    await GroupModel.insertMany(groups);
  }
  await AppMetaModel.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', activeGroupId, allMembers },
    { upsert: true }
  );
  res.json(await getGroupsPayload());
});

app.get('/api/favorites', async (_req, res) => {
  const favorites = await FavoriteModel.find().lean();
  const cartSetFavorites = await CartSetFavoriteModel.find().lean();
  res.json({
    favorites: favorites.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    cartSetFavorites: cartSetFavorites.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    })
  });
});

app.put('/api/favorites', async (req, res) => {
  const { favorites = [], cartSetFavorites = [] } = req.body || {};
  await FavoriteModel.deleteMany({});
  await CartSetFavoriteModel.deleteMany({});
  if (Array.isArray(favorites) && favorites.length > 0) {
    await FavoriteModel.insertMany(favorites);
  }
  if (Array.isArray(cartSetFavorites) && cartSetFavorites.length > 0) {
    await CartSetFavoriteModel.insertMany(cartSetFavorites);
  }
  const storedFavorites = await FavoriteModel.find().lean();
  const storedSets = await CartSetFavoriteModel.find().lean();
  res.json({
    favorites: storedFavorites.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    cartSetFavorites: storedSets.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    })
  });
});

app.get('/api/orders', async (_req, res) => {
  const orders = await OrderModel.find().sort({ orderDate: -1 }).lean();
  res.json({
    orders: orders.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    })
  });
});

app.put('/api/orders', async (req, res) => {
  const { orders = [] } = req.body || {};
  await OrderModel.deleteMany({});
  if (Array.isArray(orders) && orders.length > 0) {
    await OrderModel.insertMany(orders.map((order) => sanitizeOrder(order)));
  }
  const stored = await OrderModel.find().sort({ orderDate: -1 }).lean();
  res.json({
    orders: stored.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    })
  });
});

app.get('/api/allergens', async (_req, res) => {
  const settings = await AllergenSettingsModel.findOne({ key: 'default' }).lean();
  res.json({
    excludedAllergens: settings?.excludedAllergens ?? [],
    autoFilterEnabled: settings?.autoFilterEnabled ?? false
  });
});

app.put('/api/allergens', async (req, res) => {
  const { excludedAllergens = [], autoFilterEnabled = false } = req.body || {};
  const settings = await AllergenSettingsModel.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', excludedAllergens, autoFilterEnabled },
    { upsert: true, new: true }
  );
  res.json({
    excludedAllergens: settings.excludedAllergens,
    autoFilterEnabled: settings.autoFilterEnabled
  });
});

app.get('/api/bootstrap', async (_req, res) => {
  const [menu, groupsPayload, favoritesDoc, cartSets, orders, settings] = await Promise.all([
    getMenu(),
    getGroupsPayload(),
    FavoriteModel.find().lean(),
    CartSetFavoriteModel.find().lean(),
    OrderModel.find().sort({ orderDate: -1 }).lean(),
    AllergenSettingsModel.findOne({ key: 'default' }).lean()
  ]);

  res.json({
    menu,
    ...groupsPayload,
    favorites: favoritesDoc.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    cartSetFavorites: cartSets.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    orders: orders.map(({ _id, __v, ...rest }) => {
      void _id;
      void __v;
      return rest;
    }),
    allergenSettings: {
      excludedAllergens: settings?.excludedAllergens ?? [],
      autoFilterEnabled: settings?.autoFilterEnabled ?? false
    }
  });
});

app.post('/api/reset', async (_req, res) => {
  const group = createDefaultGroup();
  await Promise.all([
    GroupModel.deleteMany({}),
    FavoriteModel.deleteMany({}),
    CartSetFavoriteModel.deleteMany({}),
    OrderModel.deleteMany({})
  ]);
  await GroupModel.create(group);
  await AppMetaModel.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', activeGroupId: group.id, allMembers: [defaultMember()] },
    { upsert: true }
  );
  await AllergenSettingsModel.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', excludedAllergens: [], autoFilterEnabled: false },
    { upsert: true }
  );
  res.json({ ok: true, group });
});

async function start() {
  await connectMongo(MONGODB_URI);
  await seedMenu();
  await ensureDefaultAppState();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafePlate API listening on ${PORT}`);
    console.log(`MongoDB: ${MONGODB_URI}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
