import { Router } from 'express';
import { GroupModel, GroupMemberModel, FavoriteItemModel } from '../models';

export const groupsRouter = Router();

groupsRouter.get('/', async (req, res) => {
  console.log('[groups] GET /api/groups start');
  try {
    const groups = await GroupModel.find().lean();
    console.log('[groups] GET /api/groups success', { count: groups.length });
    res.json(groups);
  } catch (err) {
    console.error('[groups] GET /api/groups error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

groupsRouter.post('/', async (req, res) => {
  console.log('[groups] POST /api/groups start', { bodyKeys: Object.keys(req.body || {}) });
  try {
    const group = await GroupModel.create({ name: req.body.name });
    console.log('[groups] POST /api/groups success', { id: group._id });
    res.status(201).json(group);
  } catch (err) {
    console.error('[groups] POST /api/groups error', { error: String(err) });
    res.status(400).json({ error: 'Failed to create group', details: String(err) });
  }
});

// View a single group (also useful to log "switching groups")
groupsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('[groups] GET /api/groups/:id start', { id });
  try {
    const group = await GroupModel.findById(id).lean();
    if (!group) {
      console.warn('[groups] GET /api/groups/:id not_found', { id });
      return res.status(404).json({ error: 'Group not found' });
    }
    console.log('[groups] GET /api/groups/:id success', { id });
    res.json(group);
  } catch (err) {
    console.error('[groups] GET /api/groups/:id error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Get a group cart
groupsRouter.get('/:id/cart', async (req, res) => {
  const { id } = req.params;
  console.log('[groups] GET /api/groups/:id/cart start', { id });
  try {
    const group = await GroupModel.findById(id).lean();
    if (!group) {
      console.warn('[groups] GET /api/groups/:id/cart not_found', { id });
      return res.status(404).json({ error: 'Group not found' });
    }
    const cart = group.cart || [];
    console.log('[groups] GET /api/groups/:id/cart success', { id, count: cart.length });
    res.json(cart);
  } catch (err) {
    console.error('[groups] GET /api/groups/:id/cart error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add a customization to a group cart
groupsRouter.post('/:id/cart', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  console.log('[groups] POST /api/groups/:id/cart start', { id, bodyKeys: Object.keys(payload || {}) });

  if (!payload || !payload.progressItem) {
    console.warn('[groups] POST /api/groups/:id/cart invalid_payload', { id });
    return res.status(400).json({ error: 'Missing progressItem in payload' });
  }

  try {
    const updated = await GroupModel.findByIdAndUpdate(
      id,
      { $push: { cart: payload } },
      { new: true }
    ).lean();

    if (!updated) {
      console.warn('[groups] POST /api/groups/:id/cart not_found', { id });
      return res.status(404).json({ error: 'Group not found' });
    }

    console.log('[groups] POST /api/groups/:id/cart success', { id, cartCount: updated.cart?.length ?? 0 });
    res.status(201).json({ ok: true, cart: updated.cart });
  } catch (err) {
    console.error('[groups] POST /api/groups/:id/cart error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// List members in a group
groupsRouter.get('/:id/members', async (req, res) => {
  const { id } = req.params;
  console.log('[groups] GET /api/groups/:id/members start', { id });
  try {
    const members = await GroupMemberModel.find({ groups: id }).lean();
    console.log('[groups] GET /api/groups/:id/members success', { id, count: members.length });
    res.json(members);
  } catch (err) {
    console.error('[groups] GET /api/groups/:id/members error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// List favorites for members of a group
groupsRouter.get('/:id/members/favorites', async (req, res) => {
  const { id } = req.params;
  console.log('[groups] GET /api/groups/:id/members/favorites start', { id });
  try {
    const members = await GroupMemberModel.find({ groups: id }, { _id: 1 }).lean();
    const memberIds = members.map(m => m._id);
    const favorites = await FavoriteItemModel.find({
      'progressItem.groupId': id,
      'progressItem.assignedTo': { $in: memberIds },
    }).lean();
    console.log('[groups] GET /api/groups/:id/members/favorites success', { id, count: favorites.length });
    res.json(favorites);
  } catch (err) {
    console.error('[groups] GET /api/groups/:id/members/favorites error', { id, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});