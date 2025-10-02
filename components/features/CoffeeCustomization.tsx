import React, { useState, useEffect } from 'react';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Badge } from '@/ui/badge';
import { syrupOptions, milkOptions } from '@/data/menu';
import { CoffeeCustomization, Coffee } from '@/types';
import { useModalsStore } from '@/store/useModalsStore';
import { useGroupsStore } from '@/store/useGroupsStore';
import { AllergenController } from '@/controllers/AllergenController';

interface CoffeeCustomizationComponentProps {
  customizations: CoffeeCustomization;
  setCustomizations: (customizations: CoffeeCustomization) => void;
  coffee?: Coffee;
}

export const CoffeeCustomizationComponent: React.FC<CoffeeCustomizationComponentProps> = ({ 
  customizations, 
  setCustomizations, 
  coffee 
}) => {
  const [selectedSyrup, setSelectedSyrup] = useState<string>('');
  const { showAllergenWarning } = useModalsStore();
  const { groups, activeGroupId } = useGroupsStore();
  
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const groupMembers = activeGroup?.members || [];

  const requiresMilk = coffee?.allergens?.includes('Milk') || false;
  
  // Filter milk options based on coffee requirements
  const availableMilkOptions = requiresMilk 
    ? milkOptions.filter(option => option !== 'No Milk')
    : milkOptions;

  // Set default milk based on coffee requirements
  useEffect(() => {
    if (coffee && customizations.milk === 'Whole Milk') {
      const defaultMilk = requiresMilk ? 'Whole Milk' : 'No Milk';
      if (customizations.milk !== defaultMilk) {
        setCustomizations({ ...customizations, milk: defaultMilk });
      }
    }
  }, [coffee, requiresMilk]);

  // Helper function to get allergens for milk type
  const getMilkAllergens = (milk: string): string[] => {
    const allergens: string[] = [];
    if (milk.includes('Milk') && milk !== 'No Milk') allergens.push('Milk');
    if (milk.includes('Soy')) allergens.push('Soy');
    if (milk.includes('Almond')) allergens.push('Almonds');
    return allergens;
  };

  // Helper function to get allergens for syrup
  const getSyrupAllergens = (flavor: string): string[] => {
    const allergens: string[] = [];
    if (flavor.toLowerCase().includes('hazelnut')) {
      allergens.push('Hazelnuts', 'Nuts');
    }
    return allergens;
  };

  // Helper function to get affected members for allergens
  const getAffectedMembers = (allergens: string[]) => {
    return groupMembers.filter(member =>
      member.allergens?.some(allergen => 
        allergens.some(checkAllergen => 
          allergen.toLowerCase().includes(checkAllergen.toLowerCase()) ||
          checkAllergen.toLowerCase().includes(allergen.toLowerCase())
        )
      )
    );
  };

  const setMilk = (milk: string) => {
    // Check if milk contains allergens that affect group members
    if (milk !== 'No Milk' && groupMembers.length > 0) {
      const milkAllergens = getMilkAllergens(milk);
      const affectedMembers = getAffectedMembers(milkAllergens);
      
      if (affectedMembers.length > 0) {
        showAllergenWarning(
          milkAllergens,
          affectedMembers,
          `Coffee with ${milk}`,
          () => {
            setCustomizations({ ...customizations, milk });
          }
        );
        return;
      }
    }
    
    setCustomizations({ ...customizations, milk });
  };

  const addSyrup = (flavor: string) => {
    // Check if syrup contains allergens that affect group members
    if (groupMembers.length > 0) {
      const syrupAllergens = getSyrupAllergens(flavor);
      
      if (syrupAllergens.length > 0) {
        const affectedMembers = getAffectedMembers(syrupAllergens);
        
        if (affectedMembers.length > 0) {
          showAllergenWarning(
            syrupAllergens,
            affectedMembers,
            `Coffee with ${flavor} syrup`,
            () => {
              const existingSyrup = customizations.syrups.find(s => s.flavor === flavor);
              if (existingSyrup) {
                updateSyrupPumps(flavor, existingSyrup.pumps + 1);
              } else {
                setCustomizations({
                  ...customizations,
                  syrups: [...customizations.syrups, { flavor, pumps: 1 }]
                });
              }
            }
          );
          return;
        }
      }
    }
    
    // No allergen conflicts, proceed normally
    const existingSyrup = customizations.syrups.find(s => s.flavor === flavor);
    if (existingSyrup) {
      updateSyrupPumps(flavor, existingSyrup.pumps + 1);
    } else {
      setCustomizations({
        ...customizations,
        syrups: [...customizations.syrups, { flavor, pumps: 1 }]
      });
    }
  };

  const updateSyrupPumps = (flavor: string, pumps: number) => {
    if (pumps <= 0) {
      setCustomizations({
        ...customizations,
        syrups: customizations.syrups.filter(s => s.flavor !== flavor)
      });
    } else {
      setCustomizations({
        ...customizations,
        syrups: customizations.syrups.map(s => 
          s.flavor === flavor ? { ...s, pumps } : s
        )
      });
    }
  };

  const handleAddSyrup = () => {
    if (!selectedSyrup) return;
    addSyrup(selectedSyrup);
    setSelectedSyrup('');
  };

  // Get current milk allergens and affected members for persistent warning
  const currentMilkAllergens = customizations.milk !== 'No Milk' ? getMilkAllergens(customizations.milk) : [];
  const currentMilkAffectedMembers = currentMilkAllergens.length > 0 ? getAffectedMembers(currentMilkAllergens) : [];

return (
  <div className="">
    <div>
      <h2 className="text-lg font-semibold mb-3">Milk Type</h2>
      <div>
        <div className='border border-r-2 border-b-2'>
          <Select value={customizations.milk} onValueChange={setMilk}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select milk type" />
            </SelectTrigger>
            <SelectContent>
              {availableMilkOptions.map(milk => (
                <SelectItem key={milk} value={milk}>{milk}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Show info message for milk-required coffees */}
        {requiresMilk && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-[1px]">
            <div className="text-sm text-red-600">
              This coffee requires milk - 'No Milk' option is not available.
            </div>
          </div>
        )}
        
        {/* Persistent allergen warning for selected milk */}
        {currentMilkAffectedMembers.length > 0 && (
          <div className="mt-2 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Allergen Warning for {currentMilkAffectedMembers.map(m => m.name).join(', ')}
              </p>
              <p className="text-xs text-destructive/80">
                This item may contain: {currentMilkAllergens.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4"></div>
    </div>

    <div>
      <h2 className="text-lg font-semibold mb-3">Flavor Syrups</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className='border border-r-2 border-b-2 flex-1'>
            <Select value={selectedSyrup} onValueChange={setSelectedSyrup}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Add syrup flavor" />
              </SelectTrigger>
              <SelectContent>
                {syrupOptions.map(syrup => (
                  <SelectItem key={syrup} value={syrup}>{syrup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddSyrup} disabled={!selectedSyrup}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {customizations.syrups.length > 0 && (
          <div className="space-y-2">
            {customizations.syrups.map(syrup => {
              const syrupAllergens = getSyrupAllergens(syrup.flavor);
              const syrupAffectedMembers = syrupAllergens.length > 0 ? getAffectedMembers(syrupAllergens) : [];
              
              return (
                <div key={syrup.flavor} className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white border border-r-2 border-b-2 rounded-[1px]">
                    <span className="text-sm">{syrup.flavor}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSyrupPumps(syrup.flavor, syrup.pumps - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Badge variant="secondary">{syrup.pumps} pump{syrup.pumps !== 1 ? 's' : ''}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSyrupPumps(syrup.flavor, syrup.pumps + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Persistent allergen warning for selected syrup */}
                  {syrupAffectedMembers.length > 0 && (
                    <div className="ml-3 flex items-start gap-2 p-3 bg-destructive/10 rounded-[1px]">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">
                          Allergen Warning for {syrupAffectedMembers.map(m => m.name).join(', ')}
                        </p>
                        <p className="text-xs text-destructive/80">
                          This item may contain: {syrupAllergens.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-4 pt-4"></div>
    </div>
  </div>
);
};