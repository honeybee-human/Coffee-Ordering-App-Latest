import { CoffeeCustomization } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface CoffeeCustomizationStore {
  customization: CoffeeCustomization;
  setMilk: (milk: string) => void;
  addSyrup: (flavor: string) => void;
  updateSyrupPumps: (flavor: string, pumps: number) => void;
  removeSyrup: (flavor: string) => void;
  resetCustomization: () => void;
}

export const useCoffeeCustomizationStore = (): CoffeeCustomizationStore => {
  const {
    coffeeCustomization,
    setCoffeeMilk,
    addCoffeeSyrup,
    updateCoffeeSyrupPumps,
    removeCoffeeSyrup,
    resetCoffeeCustomization,
  } = useAppContext();

  return {
    customization: coffeeCustomization,
    setMilk: (milk: string) => setCoffeeMilk(milk),
    addSyrup: (flavor: string) => addCoffeeSyrup(flavor),
    updateSyrupPumps: (flavor: string, pumps: number) => updateCoffeeSyrupPumps(flavor, pumps),
    removeSyrup: (flavor: string) => removeCoffeeSyrup(flavor),
    resetCustomization: () => resetCoffeeCustomization(),
  };
};