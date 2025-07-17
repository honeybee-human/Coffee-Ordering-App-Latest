import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Alert, AlertDescription } from '@/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { GroupMember } from '@/types';
import { COMMON_ALLERGENS, normalizeAllergens } from '@/utils/allergens';

// Update the props interface
interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: GroupMember) => void;
  existingMembers?: GroupMember[];
  editingMember?: GroupMember | null; // Add this line
  isEditing?: boolean; // Add this line
}

// Update the component to handle editing
export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingMembers = [],
  editingMember = null,
  isEditing = false
}) => {
  // Add state for name error
  const [nameError, setNameError] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Update the state initialization to use editingMember if provided
  const [newMember, setNewMember] = useState<{ name: string; allergens: string[] }>(
    editingMember ? {
      name: editingMember.name,
      allergens: editingMember.allergens || []
    } : {
      name: '',
      allergens: []
    }
  );
  
  // Add resetForm function
  const resetForm = useCallback(() => {
    setNewMember({ name: '', allergens: [] });
    setNameError('');
    setNewAllergen('');
  }, []);
  
  // Add these handler functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAllergen(value);
    
    if (value.trim()) {
      const filtered = COMMON_ALLERGENS.filter(allergen => 
        allergen.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newAllergen.trim()) {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleAddAllergen(suggestions[selectedIndex]);
      } else {
        handleAddAllergen(newAllergen.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  const handleInputFocus = () => {
    if (newAllergen.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleAddAllergen(suggestion);
  };
  
  const handleAddAllergen = (allergen: string) => {
    const normalizedAllergen = allergen.trim();
    if (!normalizedAllergen) return;
    
    if (!newMember.allergens.includes(normalizedAllergen)) {
      setNewMember(prev => ({
        ...prev,
        allergens: [...prev.allergens, normalizedAllergen]
      }));
    }
    
    setNewAllergen('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const handleRemoveAllergen = (allergen: string) => {
    setNewMember(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Update the handleAddMember function to handle editing
  const handleAddMember = useCallback(() => {
    const trimmedName = newMember.name.trim();
    
    if (!trimmedName) {
      setNameError('Name cannot be empty.');
      return;
    }
    
    // Check for duplicate names, but allow the same name if editing
    const existingMember = existingMembers.find(member => 
      member.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingMember || member.name !== editingMember.name)
    );
    
    if (existingMember) {
      setNameError('A member with this name already exists. Usernames must be unique. Change what groups this member is in with the All Members tab.');
      return;
    }
    
    setNameError('');
    const memberToAdd: GroupMember = {
      name: trimmedName,
      allergens: normalizeAllergens(newMember.allergens)
    };
    
    onAddMember(memberToAdd);
    resetForm();
    onClose();
  }, [newMember, onAddMember, resetForm, onClose, existingMembers, editingMember]);
  
// Add this useEffect after the resetForm function (around line 55)
// This will update the form when editingMember changes
useEffect(() => {
  if (editingMember) {
    setNewMember({
      name: editingMember.name,
      allergens: editingMember.allergens || []
    });
  } else {
    resetForm();
  }
}, [editingMember, resetForm]);
  // Update the dialog title and button text based on isEditing
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Group Member' : 'Add Group Member'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update member details and allergies' : 'Enter member details and any allergies'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberName">Name</Label>
            <Input
              id="memberName"
              value={newMember.name}
              onChange={(e) => {
                setNewMember(prev => ({ ...prev, name: e.target.value }));
                if (nameError) setNameError(''); // Clear error when user starts typing
              }}
              placeholder="Enter member name"
              className={nameError ? 'border-destructive' : ''}
            />
            {nameError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{nameError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label>Allergies</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                value={newAllergen}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Type to add allergies"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                        index === selectedIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {newMember.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newMember.allergens.map(allergen => (
                  <Badge
                    key={allergen}
                    variant="secondary"
                    className="flex items-center gap-1 text-base"
                  >
                    {allergen}
                    <button
                      onClick={() => handleRemoveAllergen(allergen)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              <Save className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{isEditing ? 'Save Changes' : 'Add Member'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
