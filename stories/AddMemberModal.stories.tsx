import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AddMemberModal } from '../components/modals/AddMemberModal';
import { GroupMember } from '../types';

const meta = {
  title: 'Modals/AddMemberModal',
  component: AddMemberModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    onAddMember: { action: 'memberAdded' },
    existingMembers: { control: 'array' },
  },
} satisfies Meta<typeof AddMemberModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveAddMemberModal = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);
  const [members, setMembers] = useState<GroupMember[]>(args.existingMembers || []);
  
  const handleClose = () => {
    setIsOpen(false);
    args.onClose?.();
  };
  
  const handleAddMember = (member: GroupMember) => {
    setMembers([...members, member]);
    args.onAddMember?.(member);
    setIsOpen(false);
  };
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Open Modal
      </button>
      
      <AddMemberModal 
        isOpen={isOpen}
        onClose={handleClose}
        onAddMember={handleAddMember}
        existingMembers={members}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveAddMemberModal {...args} />,
  args: {
    isOpen: false,
    existingMembers: [],
  },
};

export const OpenWithExistingMembers: Story = {
  render: (args: Story['args']) => <InteractiveAddMemberModal {...args} />,
  args: {
    isOpen: true,
    existingMembers: [
      { id: '1', name: 'John', allergens: ['Nuts'] },
      { id: '2', name: 'Sarah', allergens: ['Milk', 'Soy'] },
    ],
  },
};