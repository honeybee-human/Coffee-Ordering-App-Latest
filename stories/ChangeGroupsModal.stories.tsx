import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChangeGroupsModal } from '../components/modals/ChangeGroupsModal';
import { Group, GroupMember } from '../types';

const meta = {
  title: 'Modals/ChangeGroupsModal',
  component: ChangeGroupsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    selectedMember: { control: 'object' },
    groups: { control: 'array' },
    onToggleMemberGroup: { action: 'memberGroupToggled' },
  },
} satisfies Meta<typeof ChangeGroupsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveChangeGroupsModal = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);
  const [groups, setGroups] = useState<Group[]>(args.groups || []);
  
  const handleClose = () => {
    setIsOpen(false);
    args.onClose?.();
  };
  
  const handleToggleMemberGroup = (groupId: string, isMember: boolean) => {
    setGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.id === groupId) {
          if (isMember) {
            // Add member to group
            return {
              ...group,
              members: [...group.members, args.selectedMember]
            };
          } else {
            // Remove member from group
            return {
              ...group,
              members: group.members.filter(m => 
                m.name !== args.selectedMember.name || 
                JSON.stringify(m.allergens.sort()) !== JSON.stringify(args.selectedMember.allergens.sort())
              )
            };
          }
        }
        return group;
      });
    });
    
    args.onToggleMemberGroup?.(groupId, isMember);
  };
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded">
        Open Modal
      </button>
      
      <ChangeGroupsModal 
        isOpen={isOpen}
        onClose={handleClose}
        selectedMember={args.selectedMember}
        groups={groups}
        onToggleMemberGroup={handleToggleMemberGroup}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveChangeGroupsModal {...args} />,
  args: {
    isOpen: false,
    selectedMember: {
      id: 'member-1',
      name: 'John',
      allergens: ['Nuts']
    },
    groups: [
      {
        id: 'group-1',
        name: 'Family',
        members: [
          {
            id: 'member-1',
            name: 'John',
            allergens: ['Nuts']
          }
        ],
        cart: [],
        dateCreated: new Date()
      },
      {
        id: 'group-2',
        name: 'Work',
        members: [],
        cart: [],
        dateCreated: new Date()
      },
      {
        id: 'group-3',
        name: 'Friends',
        members: [],
        cart: [],
        dateCreated: new Date()
      }
    ]
  },
};

export const OpenModal: Story = {
  render: (args: Story['args']) => <InteractiveChangeGroupsModal {...args} />,
  args: {
    ...Default.args,
    isOpen: true,
  },
};

export const WithMultipleGroups: Story = {
  render: (args: Story['args']) => <InteractiveChangeGroupsModal {...args} />,
  args: {
    ...Default.args,
    isOpen: true,
    selectedMember: {
      id: 'member-2',
      name: 'Sarah',
      allergens: ['Milk', 'Soy']
    },
    groups: [
      {
        id: 'group-1',
        name: 'Family',
        members: [
          {
            id: 'member-1',
            name: 'John',
            allergens: ['Nuts']
          },
          {
            id: 'member-2',
            name: 'Sarah',
            allergens: ['Milk', 'Soy']
          }
        ],
        cart: [],
        dateCreated: new Date()
      },
      {
        id: 'group-2',
        name: 'Work',
        members: [
          {
            id: 'member-2',
            name: 'Sarah',
            allergens: ['Milk', 'Soy']
          }
        ],
        cart: [],
        dateCreated: new Date()
      },
      {
        id: 'group-3',
        name: 'Friends',
        members: [],
        cart: [],
        dateCreated: new Date()
      }
    ]
  },
};