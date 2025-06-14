import type { Meta, StoryObj } from '@storybook/react';
import { AllergenTag } from '../components/shared/AllergenTag';

const meta = {
  title: 'Components/AllergenTag',
  component: AllergenTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    groupAllergens: { control: 'array' },
  },
} satisfies Meta<typeof AllergenTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: {
      name: 'Cappuccino',
      allergens: ['Milk'],
      ingredients: ['Espresso', 'Steamed Milk', 'Milk Foam'],
    },
    groupAllergens: [],
  },
};

export const WithGroupAllergens: Story = {
  args: {
    item: {
      name: 'Cappuccino',
      allergens: ['Milk'],
      ingredients: ['Espresso', 'Steamed Milk', 'Milk Foam'],
    },
    groupAllergens: ['Milk', 'Nuts'],
  },
};

export const WithDetectedAllergens: Story = {
  args: {
    item: {
      name: 'Hazelnut Latte',
      allergens: ['Milk'],
      ingredients: ['Espresso', 'Steamed Milk', 'Hazelnut Syrup'],
    },
    groupAllergens: ['Milk', 'Nuts'],
  },
};

export const MultipleAllergens: Story = {
  args: {
    item: {
      name: 'Almond Croissant',
      allergens: ['Gluten', 'Nuts', 'Eggs'],
      ingredients: ['Flour', 'Butter', 'Almonds', 'Sugar', 'Eggs'],
    },
    groupAllergens: ['Gluten', 'Nuts', 'Eggs', 'Milk'],
  },
};

export const NoAllergens: Story = {
  args: {
    item: {
      name: 'Black Coffee',
      allergens: [],
      ingredients: ['Coffee Beans', 'Water'],
    },
    groupAllergens: ['Milk', 'Nuts', 'Soy'],
  },
};