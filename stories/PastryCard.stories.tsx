import type { Meta, StoryObj } from '@storybook/react';
import { PastryCard } from '../components/shared/PastryCard';

const meta = {
  title: 'Components/PastryCard',
  component: PastryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    pastry: { control: 'object' },
    onSelect: { action: 'selected' },
    groupAllergens: { control: 'array' },
  },
} satisfies Meta<typeof PastryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pastry: {
      id: '1',
      name: 'Chocolate Croissant',
      description: 'Buttery, flaky croissant filled with rich chocolate.',
      price: 3.99,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allergens: ['Gluten', 'Milk', 'Eggs'],
      ingredients: ['Flour', 'Butter', 'Chocolate', 'Sugar', 'Eggs'],
      customizationOptions: {
        extras: ['Warm it up', 'Add Butter', 'Add Jam']
      }
    },
    groupAllergens: [],
  },
};

export const WithGroupAllergens: Story = {
  args: {
    ...Default.args,
    groupAllergens: ['Gluten', 'Nuts'],
  },
};

export const WithDetectedAllergens: Story = {
  args: {
    pastry: {
      id: '2',
      name: 'Almond Croissant',
      description: 'Buttery croissant filled with almond paste and topped with sliced almonds.',
      price: 4.49,
      image: 'https://images.unsplash.com/photo-1623334044303-241021148842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allergens: ['Gluten', 'Milk', 'Eggs'],
      ingredients: ['Flour', 'Butter', 'Almond Paste', 'Almonds', 'Sugar', 'Eggs'],
      customizationOptions: {
        extras: ['Warm it up', 'Add Butter']
      }
    },
    groupAllergens: ['Gluten', 'Nuts'],
  },
};

export const NoImage: Story = {
  args: {
    pastry: {
      id: '3',
      name: 'Plain Bagel',
      description: 'Traditional plain bagel, chewy on the inside with a crisp exterior.',
      price: 2.99,
      image: '',
      allergens: ['Gluten'],
      ingredients: ['Flour', 'Water', 'Yeast', 'Salt', 'Sugar'],
      customizationOptions: {
        extras: ['Toasted', 'Add Cream Cheese', 'Add Butter', 'Add Jam']
      }
    },
    groupAllergens: ['Milk', 'Nuts'],
  },
};