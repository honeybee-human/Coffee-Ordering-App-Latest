import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import OnboardingModal from '../components/modals/OnboardingModal';

const meta = {
  title: 'Modals/OnboardingModal',
  component: OnboardingModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof OnboardingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveOnboardingModal = (args: any) => {
  const [open, setOpen] = useState(args.open || false);
  
  const handleClose = () => {
    setOpen(false);
    args.onClose?.();
  };
  
  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Open Onboarding
      </button>
      
      <OnboardingModal 
        open={open}
        onClose={handleClose}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveOnboardingModal {...args} />,
  args: {
    open: false,
  },
};

export const OpenModal: Story = {
  render: (args: Story['args']) => <InteractiveOnboardingModal {...args} />,
  args: {
    open: true,
  },
};