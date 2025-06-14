import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CreateGroupModal } from '../components/modals/CreateGroupModal';

const meta = {
  title: 'Modals/CreateGroupModal',
  component: CreateGroupModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    onCreateGroup: { action: 'groupCreated' },
  },
} satisfies Meta<typeof CreateGroupModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveCreateGroupModal = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);
  
  const handleClose = () => {
    setIsOpen(false);
    args.onClose?.();
  };
  
  const handleCreateGroup = (groupName: string) => {
    args.onCreateGroup?.(groupName);
    setIsOpen(false);
  };
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Open Modal
      </button>
      
      <CreateGroupModal 
        isOpen={isOpen}
        onClose={handleClose}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveCreateGroupModal {...args} />,
  args: {
    isOpen: false,
  },
};

export const Open: Story = {
  render: (args: Story['args']) => <InteractiveCreateGroupModal {...args} />,
  args: {
    isOpen: true,
  },
};