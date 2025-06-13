import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Alert, AlertDescription } from '@/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { GroupMember } from '@/types';
import { COMMON_ALLERGENS, normalizeAllergens } from '@/utils/allergens';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: GroupMember) => void;
  existingMembers?: GroupMember[];
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingMembers = []
}) => {
  const [newMember, setNewMember] = useState<{ name: string; allergens: string[] }>({
    name: '',
    allergens: []
  });
  const [newAllergen, setNewAllergen] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [nameError, setNameError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on prefix matching
  const suggestions = useMemo(() => {
    const searchTerm = newAllergen.toLowerCase().trim();
    if (!searchTerm) return [];
    
    return COMMON_ALLERGENS
      .filter(allergen => 
        !newMember.allergens.includes(allergen) &&
        allergen.toLowerCase().startsWith(searchTerm)
      )
      .slice(0, 8);
  }, [newAllergen, newMember.allergens]);

  const resetForm = useCallback(() => {
    setNewMember({ name: '', allergens: [] });
    setNewAllergen('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setNameError('');
  }, []);

  const handleAddMember = useCallback(() => {
    const trimmedName = newMember.name.trim();
    
    if (!trimmedName) {
      setNameError('Name cannot be empty.');
      return;
    }
    
    // Check for duplicate names
    const existingMember = existingMembers.find(member => 
      member.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingMember) {
      setNameError('A member with this name already exists. Usernames must be unique.');
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
  }, [newMember, onAddMember, resetForm, onClose, existingMembers]);

  const handleAddAllergen = useCallback((allergen?: string) => {
    const allergenToAdd = allergen || newAllergen.trim();
    if (allergenToAdd) {
      const normalizedAllergen = normalizeAllergens([allergenToAdd])[0];
      if (normalizedAllergen && !newMember.allergens.includes(normalizedAllergen)) {
        setNewMember(prev => ({
          ...prev,
          allergens: [...prev.allergens, normalizedAllergen]
        }));
        setNewAllergen('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
  }, [newAllergen, newMember.allergens]);

  const handleRemoveAllergen = useCallback((allergen: string) => {
    setNewMember(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Autocomplete handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAllergen(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddAllergen();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleAddAllergen(suggestions[selectedIndex]);
        } else {
          handleAddAllergen();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleAddAllergen]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleAddAllergen(suggestion);
  }, [handleAddAllergen]);

  const handleInputFocus = useCallback(() => {
    if (newAllergen.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [newAllergen]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group Member</DialogTitle>
          <DialogDescription>
            Enter member details and any allergies
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
                    className="flex items-center gap-1"
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
              Add Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};