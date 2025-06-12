import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Badge } from '@/ui/badge';
import { CoffeeCustomization } from '@/types';
import { syrupOptions, milkOptions } from '@/data/menu';

interface CoffeeCustomizationProps {
  customization: CoffeeCustomization;
  onChange: (customization: CoffeeCustomization) => void;
}

export const CoffeeCustomizationComponent: React.FC<CoffeeCustomizationProps> = ({
  customization,
  onChange
}) => {
  const [selectedSyrup, setSelectedSyrup] = useState<string>('');

  const addSyrup = () => {
    if (!selectedSyrup) return;
    
    const existingSyrup = customization.syrups.find(s => s.flavor === selectedSyrup);
    if (existingSyrup) {
      onChange({
        ...customization,
        syrups: customization.syrups.map(s =>
          s.flavor === selectedSyrup ? { ...s, pumps: s.pumps + 1 } : s
        )
      });
    } else {
      onChange({
        ...customization,
        syrups: [...customization.syrups, { flavor: selectedSyrup, pumps: 1 }]
      });
    }
    setSelectedSyrup('');
  };

  const updateSyrupPumps = (flavor: string, pumps: number) => {
    if (pumps <= 0) {
      onChange({
        ...customization,
        syrups: customization.syrups.filter(s => s.flavor !== flavor)
      });
    } else {
      onChange({
        ...customization,
        syrups: customization.syrups.map(s =>
          s.flavor === flavor ? { ...s, pumps } : s
        )
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">Milk Type</h2>
        <div>
          <Select value={customization.milk} onValueChange={(milk) => onChange({ ...customization, milk })}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select milk type" />
            </SelectTrigger>
            <SelectContent>
              {milkOptions.map(milk => (
                <SelectItem key={milk} value={milk}>{milk}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="border-t mt-4 pt-4"></div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Flavor Syrups</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedSyrup} onValueChange={setSelectedSyrup}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Add syrup flavor" />
              </SelectTrigger>
              <SelectContent>
                {syrupOptions.map(syrup => (
                  <SelectItem key={syrup} value={syrup}>{syrup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSyrup} disabled={!selectedSyrup}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {customization.syrups.length > 0 && (
            <div className="space-y-2">
              {customization.syrups.map(syrup => (
                <div key={syrup.flavor} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{syrup.flavor}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSyrupPumps(syrup.flavor, syrup.pumps - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Badge variant="secondary">{syrup.pumps} pump{syrup.pumps !== 1 ? 's' : ''}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSyrupPumps(syrup.flavor, syrup.pumps + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t mt-4 pt-4"></div>
      </div>
    </div>
  );
};