import type { Meta, StoryObj } from '@storybook/react';
import { OrderCompleteModal } from '../components/modals/OrderCompleteModal';
import { useModalsStore } from '../store/useModalsStore';

const meta = {
  title: 'Modals/OrderCompleteModal',
  component: OrderCompleteModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrderCompleteModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorator to set up the modal state
const WithModalState = (Story: any, context: any) => {
  // Initialize the modal state based on story args
  const openOrderCompleteModal = useModalsStore(state => state.openOrderCompleteModal);
  const { isOpen, orderNumber, estimatedTime } = context.args;
  
  // Only open the modal if isOpen is true
  if (isOpen) {
    openOrderCompleteModal({
      orderNumber: orderNumber || 'ORD-12345',
      estimatedTime: estimatedTime || 15
    });
  }
  
  return <Story />;
};

export const Default: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    orderNumber: 'ORD-12345',
    estimatedTime: 15,
  },
};

export const LongerWaitTime: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: true,
    orderNumber: 'ORD-67890',
    estimatedTime: 30,
  },
};

export const Closed: Story = {
  decorators: [WithModalState],
  args: {
    isOpen: false,
  },
};