import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { GroupFilter } from '../components/shared/GroupFilter';

const meta = {
  title: 'Components/GroupFilter',
  component: GroupFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    groupNames: { control: 'array' },
    selectedGroup: { control: 'text' },
    onChange: { action: 'changed' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof GroupFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveGroupFilter = (args: any) => {
  const [selectedGroup, setSelectedGroup] = useState(args.selectedGroup || 'all');
  
  const handleChange = (group: string) => {
    setSelectedGroup(group);
    args.onChange?.(group);
  };
  
  return (
    <GroupFilter 
      {...args}
      selectedGroup={selectedGroup}
      onChange={handleChange}
    />
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveGroupFilter {...args} />,
  args: {
    groupNames: ['Family', 'Work', 'Friends'],
    selectedGroup: 'all',
    label: 'Filter by group:',
  },
};

export const WithSelectedGroup: Story = {
  render: (args: Story['args']) => <InteractiveGroupFilter {...args} />,
  args: {
    ...Default.args,
    selectedGroup: 'Work',
  },
};

export const WithCustomLabel: Story = {
  render: (args: Story['args']) => <InteractiveGroupFilter {...args} />,
  args: {
    ...Default.args,
    label: 'Select a group:',
  },
};

export const SingleGroup: Story = {
  render: (args: Story['args']) => <InteractiveGroupFilter {...args} />,
  args: {
    groupNames: ['Family'],
    selectedGroup: 'Family',
  },
};

export const NoGroups: Story = {
  render: (args: Story['args']) => <InteractiveGroupFilter {...args} />,
  args: {
    groupNames: [],
    selectedGroup: '',
  },
};

export const ManyGroups: Story = {
  render: (args) => <InteractiveGroupFilter {...args} />,
  args: {
    ...Default.args,
    groupNames: ['Family', 'Work', 'Friends', 'Book Club', 'Gym Buddies', 'Neighbors', 'School'],
  },
};

export const NoGroups: Story = {
  args: {
    groupNames: [],
    selectedGroup: 'all',
  },
};