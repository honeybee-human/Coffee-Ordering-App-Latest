import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AllergenSettingsModel,
  AppMetaModel,
  GroupModel,
  MenuItemModel
} from './models';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readJson<T>(relativeFromRepoRoot: string): T {
  const candidates = [
    path.resolve(__dirname, '../../', relativeFromRepoRoot),
    path.resolve(__dirname, '../../../', relativeFromRepoRoot)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, 'utf8')) as T;
    }
  }
  throw new Error(`Could not find ${relativeFromRepoRoot}`);
}

type CoffeeSeed = {
  id: string;
  name: string;
  price: number;
  allergens: string[];
  description?: string;
  image?: string;
};

type PastrySeed = CoffeeSeed & {
  ingredients?: string[];
  removableIngredients: string[];
};

export function defaultMember() {
  return { name: 'You', allergens: ['Blueberries', 'Hazelnuts'] };
}

export function createDefaultGroup() {
  const member = defaultMember();
  return {
    id: Date.now().toString(),
    name: 'My First Group',
    members: [member],
    cart: [] as unknown[],
    dateCreated: new Date(),
    isFavorite: false
  };
}

export async function seedMenu() {
  const coffee = readJson<CoffeeSeed[]>('data/coffee-menu.json');
  const pastry = readJson<PastrySeed[]>('data/pastry-menu.json');

  const docs = [
    ...coffee.map((item) => ({ ...item, kind: 'coffee' as const })),
    ...pastry.map((item) => ({ ...item, kind: 'pastry' as const }))
  ];

  for (const doc of docs) {
    await MenuItemModel.findOneAndUpdate({ id: doc.id }, doc, { upsert: true, new: true });
  }
}

export async function ensureDefaultAppState() {
  const groupCount = await GroupModel.countDocuments();
  if (groupCount === 0) {
    const group = createDefaultGroup();
    await GroupModel.create(group);
    await AppMetaModel.findOneAndUpdate(
      { key: 'default' },
      { key: 'default', activeGroupId: group.id, allMembers: [defaultMember()] },
      { upsert: true }
    );
  } else {
    await AppMetaModel.findOneAndUpdate(
      { key: 'default' },
      { $setOnInsert: { key: 'default', activeGroupId: null, allMembers: [] } },
      { upsert: true }
    );
  }

  await AllergenSettingsModel.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: { key: 'default', excludedAllergens: [], autoFilterEnabled: false } },
    { upsert: true }
  );
}
