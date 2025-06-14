import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import { SearchBar } from '@/components/shared/SearchBar';

describe('SearchBar', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnSearchModeChange = jest.fn();
  
  beforeEach(() => {
    mockOnSearchChange.mockClear();
    mockOnSearchModeChange.mockClear();
  });
  
  it('renders correctly with default props', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="name"
        onSearchModeChange={mockOnSearchModeChange}
      />
    );
    
    // Check if the input is rendered
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    expect(searchInput).toBeTruthy();
    
    // Check if the select is rendered
    const selectButton = screen.getByRole('button', { name: /search by name/i });
    expect(selectButton).toBeTruthy();
  });
  
  it('calls onSearchChange when input value changes', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="name"
        onSearchModeChange={mockOnSearchModeChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'coffee' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('coffee');
  });
  
  it('displays the correct placeholder based on searchMode', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="description"
        onSearchModeChange={mockOnSearchModeChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search by description/i);
    expect(searchInput).toBeTruthy();
  });
  
  it('uses custom placeholder when provided', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="name"
        onSearchModeChange={mockOnSearchModeChange}
        placeholder="Custom placeholder"
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/custom placeholder/i);
    expect(searchInput).toBeTruthy();
  });
  
  it('calls onSearchModeChange when select value changes', async () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="name"
        onSearchModeChange={mockOnSearchModeChange}
      />
    );
    
    // Open the select dropdown
    const selectButton = screen.getByRole('button', { name: /search by name/i });
    fireEvent.click(selectButton);
    
    // Click on the 'Search by Description' option
    const descriptionOption = screen.getByRole('option', { name: /search by description/i });
    fireEvent.click(descriptionOption);
    
    expect(mockOnSearchModeChange).toHaveBeenCalledWith('description');
  });
  
  it('applies custom className when provided', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        searchMode="name"
        onSearchModeChange={mockOnSearchModeChange}
        className="custom-class"
      />
    );
    
    // The main container should have the custom class
    const container = screen.getByRole('textbox').closest('div')?.parentElement ?? null;
    expect(container?.classList.contains('custom-class')).toBe(true);
  });
});