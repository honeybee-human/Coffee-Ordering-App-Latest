import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '../components/shared/SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    searchQuery: { control: 'text' },
    onSearchChange: { action: 'searchChanged' },
    searchMode: { control: 'select', options: ['name', 'description', 'ingredients'] },
    onSearchModeChange: { action: 'searchModeChanged' },
    placeholder: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchQuery: '',
    onSearchChange: (value: string) => console.log('Search changed:', value),
    searchMode: 'name',
    onSearchModeChange: (mode: string) => console.log('Search mode changed:', mode),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    ...Default.args,
    placeholder: 'Search for your favorite coffee...',
  },
};

export const WithInitialValue: Story = {
  args: {
    ...Default.args,
    searchQuery: 'Cappuccino',
  },
};

export const DescriptionMode: Story = {
  args: {
    ...Default.args,
    searchMode: 'description',
  },
};

export const IngredientsMode: Story = {
  args: {
    ...Default.args,
    searchMode: 'ingredients',
  },
};

export const WithCustomClass: Story = {
  args: {
    ...Default.args,
    className: 'bg-amber-50 border-amber-200',
  },
};