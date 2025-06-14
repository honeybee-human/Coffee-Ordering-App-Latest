import type { Meta, StoryObj } from '@storybook/react';
import { FavoriteCard } from '../components/shared/FavoriteCard';

const meta = {
  title: 'Components/FavoriteCard',
  component: FavoriteCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    favorite: { control: 'object' },
    groupAllergens: { control: 'array' },
    groupMembers: { control: 'array' },
    onAddToCart: { action: 'addedToCart' },
    onNavigateToDetail: { action: 'navigatedToDetail' },
    onEdit: { action: 'edited' },
    formatCustomizations: { action: 'formattedCustomizations' },
  },
} satisfies Meta<typeof FavoriteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoffeeFavorite: Story = {
  args: {
    favorite: {
      id: 'fav-1',
      type: 'coffee',
      item: {
        id: '1',
        name: 'Cappuccino',
        description: 'A classic Italian coffee drink prepared with espresso, hot milk, and steamed-milk foam.',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        allergens: ['Milk'],
        ingredients: ['Espresso', 'Steamed Milk', 'Milk Foam'],
      },
      customizations: {
        size: 'Medium',
        milk: 'Whole Milk',
        extras: ['Extra Shot']
      },
      groupId: 'group-1',
      assignedTo: null
    },
    groupAllergens: ['Nuts'],
    groupMembers: [
      { id: 'member-1', name: 'John', allergens: ['Nuts'] },
      { id: 'member-2', name: 'Sarah', allergens: ['Milk'] }
    ],
    formatCustomizations: () => 'Medium, Whole Milk, Extra Shot'
  },
};

export const PastryFavorite: Story = {
  args: {
    favorite: {
      id: 'fav-2',
      type: 'pastry',
      item: {
        id: '2',
        name: 'Chocolate Croissant',
        description: 'Buttery, flaky croissant filled with rich chocolate.',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        allergens: ['Gluten', 'Milk', 'Eggs'],
        ingredients: ['Flour', 'Butter', 'Chocolate', 'Sugar', 'Eggs'],
      },
      customizations: {
        extras: ['Warm it up']
      },
      groupId: 'group-1',
      assignedTo: null
    },
    groupAllergens: ['Gluten'],
    groupMembers: [
      { id: 'member-1', name: 'John', allergens: ['Nuts'] },
      { id: 'member-2', name: 'Sarah', allergens: ['Gluten'] }
    ],
    formatCustomizations: () => 'Warm it up'
  },
};

export const AssignedFavorite: Story = {
  args: {
    favorite: {
      id: 'fav-3',
      type: 'coffee',
      item: {
        id: '3',
        name: 'Latte',
        description: 'Espresso with steamed milk.',
        price: 4.49,
        image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        allergens: ['Milk'],
        ingredients: ['Espresso', 'Steamed Milk'],
      },
      customizations: {
        size: 'Large',
        milk: 'Oat Milk',
        extras: []
      },
      groupId: 'group-1',
      assignedTo: 'member-1'
    },
    groupAllergens: ['Milk', 'Nuts'],
    groupMembers: [
      { id: 'member-1', name: 'John', allergens: ['Nuts'] },
      { id: 'member-2', name: 'Sarah', allergens: ['Milk'] }
    ],
    formatCustomizations: () => 'Large, Oat Milk'
  },
};