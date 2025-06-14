import type { Meta, StoryObj } from '@storybook/react';
import { AllergenWarning } from '../components/shared/AllergenWarning';
import { useModalsStore } from '../store/useModalsStore';

const meta = {
  title: 'Components/AllergenWarning',
  component: AllergenWarning,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AllergenWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorator to set up the modal state
const WithModalState = (Story: any, context: any) => {
  // Initialize the modal state based on story args
  const openAllergenWarning = useModalsStore(state => state.openAllergenWarning);
  const { isOpen, itemName, allergens, affectedMembers } = context.args;
  
  // Only open the modal if isOpen is true
  if (isOpen) {
    openAllergenWarning({
      itemName: itemName || 'Hazelnut Latte',
      allergens: allergens || ['Nuts'],
      affectedMembers: affectedMembers || [
        { id: '1', name: 'John', allergens: ['Nuts'] },
        { id: '2', name: 'Sarah', allergens: ['Nuts', 'Milk'] }
      ]
    });
  }
  
  return <Story />;
};

export const Default: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    itemName: 'Hazelnut Latte',
    allergens: ['Nuts'],
    affectedMembers: [
      { id: '1', name: 'John', allergens: ['Nuts'] },
      { id: '2', name: 'Sarah', allergens: ['Nuts', 'Milk'] }
    ]
  },
};

export const MultipleAllergens: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    itemName: 'Almond Croissant',
    allergens: ['Nuts', 'Gluten', 'Eggs'],
    affectedMembers: [
      { id: '1', name: 'John', allergens: ['Nuts'] },
      { id: '2', name: 'Sarah', allergens: ['Gluten'] },
      { id: '3', name: 'Mike', allergens: ['Eggs'] }
    ]
  },
};

export const Closed: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: false
  },
};