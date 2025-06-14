import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AllergenFilter } from '../components/shared/AllergenFilter';

const meta = {
  title: 'Components/AllergenFilter',
  component: AllergenFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AllergenFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive decorator to handle state
const InteractiveAllergenFilter = (args: any) => {
  const [filtersOpen, setFiltersOpen] = useState(args.filtersOpen || false);
  const [excludedAllergens, setExcludedAllergens] = useState(args.excludedAllergens || []);
  
  const handleToggleAllergenFilter = (allergen: string) => {
    setExcludedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen) 
        : [...prev, allergen]
    );
  };
  
  const handleClearAllergenFilters = () => {
    setExcludedAllergens([]);
  };
  
  return (
    <div style={{ width: '400px' }}>
      <AllergenFilter 
        {...args}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        excludedAllergens={excludedAllergens}
        onToggleAllergenFilter={handleToggleAllergenFilter}
        onClearAllergenFilters={handleClearAllergenFilters}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args: Story['args']) => <InteractiveAllergenFilter {...args} />,
  args: {
    filtersOpen: true,
    allAllergens: ['Milk', 'Nuts', 'Soy', 'Gluten', 'Eggs'],
    groupBasedAllergens: ['Milk', 'Nuts'],
    filteredOutCount: 0,
    excludedAllergens: [],
  },
};

export const WithExcludedAllergens: Story = {
  render: (args: Story['args']) => <InteractiveAllergenFilter {...args} />,
  args: {
    ...Default.args,
    excludedAllergens: ['Milk', 'Nuts'],
    filteredOutCount: 5,
  },
};

export const Closed: Story = {
  render: (args: Story['args']) => <InteractiveAllergenFilter {...args} />,
  args: {
    ...Default.args,
    filtersOpen: false,
  },
};

export const WithGroupBasedAllergens: Story = {
  render: (args: Story['args']) => <InteractiveAllergenFilter {...args} />,
  args: {
    ...Default.args,
    groupBasedAllergens: ['Milk', 'Nuts', 'Soy'],
  },
};