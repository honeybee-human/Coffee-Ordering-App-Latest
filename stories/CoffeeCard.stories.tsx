import type { Meta, StoryObj } from '@storybook/react';
import { CoffeeCard } from '../components/shared/CoffeeCard';

const meta = {
  title: 'Components/CoffeeCard',
  component: CoffeeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    coffee: { control: 'object' },
    onSelect: { action: 'selected' },
    groupAllergens: { control: 'array' },
  },
} satisfies Meta<typeof CoffeeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    coffee: {
      id: '1',
      name: 'Cappuccino',
      description: 'A classic Italian coffee drink prepared with espresso, hot milk, and steamed-milk foam.',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allergens: ['Milk'],
      ingredients: ['Espresso', 'Steamed Milk', 'Milk Foam'],
      customizationOptions: {
        size: ['Small', 'Medium', 'Large'],
        milk: ['Whole Milk', 'Skim Milk', 'Almond Milk', 'Oat Milk'],
        extras: ['Extra Shot', 'Vanilla Syrup', 'Caramel Syrup', 'Hazelnut Syrup']
      }
    },
    groupAllergens: [],
  },
};

export const WithGroupAllergens: Story = {
  args: {
    ...Default.args,
    groupAllergens: ['Milk', 'Nuts'],
  },
};

export const WithDetectedAllergens: Story = {
  args: {
    coffee: {
      id: '2',
      name: 'Hazelnut Latte',
      description: 'Espresso with steamed milk and hazelnut syrup.',
      price: 5.49,
      image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      allergens: ['Milk'],
      ingredients: ['Espresso', 'Steamed Milk', 'Hazelnut Syrup'],
      customizationOptions: {
        size: ['Small', 'Medium', 'Large'],
        milk: ['Whole Milk', 'Skim Milk', 'Almond Milk', 'Oat Milk'],
        extras: ['Extra Shot', 'Whipped Cream', 'Chocolate Drizzle']
      }
    },
    groupAllergens: ['Milk', 'Nuts'],
  },
};

export const NoImage: Story = {
  args: {
    coffee: {
      id: '3',
      name: 'Americano',
      description: 'Espresso diluted with hot water.',
      price: 3.99,
      image: '',
      allergens: [],
      ingredients: ['Espresso', 'Hot Water'],
      customizationOptions: {
        size: ['Small', 'Medium', 'Large'],
        extras: ['Extra Shot']
      }
    },
    groupAllergens: ['Milk', 'Nuts'],
  },
};