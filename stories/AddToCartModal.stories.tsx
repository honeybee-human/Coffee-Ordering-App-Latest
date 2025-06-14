import type { Meta, StoryObj } from '@storybook/react';
import { AddToCartModal } from '../components/modals/AddToCartModal';
import { useModalsStore } from '../store/useModalsStore';

const meta = {
  title: 'Modals/AddToCartModal',
  component: AddToCartModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AddToCartModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorator to set up the modal state
const WithModalState = (Story: any, context: any) => {
  // Initialize the modal state based on story args
  const openAddToCartModal = useModalsStore(state => state.openAddToCartModal);
  const { isOpen, itemName } = context.args;
  
  // Only open the modal if isOpen is true
  if (isOpen) {
    openAddToCartModal(itemName || 'Cappuccino');
  }
  
  return <Story />;
};

export const Default: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    itemName: 'Cappuccino',
  },
};

export const WithPastryItem: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    itemName: 'Chocolate Croissant',
  },
};

export const Closed: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: false,
  },
};