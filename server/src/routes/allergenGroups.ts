import { Router } from 'express';
import { AllergenGroupModel, IndividualAllergenModel } from '../models';

export const allergenGroupsRouter = Router();

// GET /api/allergen-groups - returns { groups, individualAllergens }
allergenGroupsRouter.get('/', async (_req, res) => {
  console.log('[allergen-groups] GET /api/allergen-groups start');
  try {
    const [groups, individuals] = await Promise.all([
      AllergenGroupModel.find({}).lean(),
      IndividualAllergenModel.find({}).lean(),
    ]);
    const individualAllergens = individuals.map(i => i.name);
    console.log('[allergen-groups] GET /api/allergen-groups success', { groups: groups.length, individuals: individualAllergens.length });
    res.json({ groups, individualAllergens });
  } catch (err) {
    console.error('[allergen-groups] GET /api/allergen-groups error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch allergen groups' });
  }
});

// GET /api/allergen-groups/:id - return a single group by id
allergenGroupsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('[allergen-groups] GET /api/allergen-groups/:id start', { id });
  try {
    const group = await AllergenGroupModel.findOne({ id }).lean();
    if (!group) {
      console.warn('[allergen-groups] GET /api/allergen-groups/:id not_found', { id });
      return res.status(404).json({ error: 'Allergen group not found' });
    }
    console.log('[allergen-groups] GET /api/allergen-groups/:id success', { id });
    res.json(group);
  } catch (err) {
    console.error('[allergen-groups] GET /api/allergen-groups/:id error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch allergen group' });
  }
});