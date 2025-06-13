import React from 'react';
import { Star, Users, Clock } from 'lucide-react';
import { Menu } from '@/components/pages/Menu';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useActiveGroup } from '@/store/useGroupsStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAllergensStore } from '@/store/useAllergensStore';

export const MenuPage: React.FC = () => {
  const activeGroup = useActiveGroup();
  const { navigateToCoffeeDetail, navigateToPastryDetail } = useNavigationStore();
  const { toggleFavorite, isItemFavorited } = useFavoritesStore();
  const { excludedAllergens, toggleAllergenFilter, clearAllergenFilters } = useAllergensStore();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60"></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80"
          alt="Artisan coffee being brewed in a modern cafe setting"
          className="w-full h-48 sm:h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">Bean & Bite</h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium opacity-90">
              Group Coffee & Pastry Ordering Made Simple
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mt-4 sm:mt-6">
              <div className="flex items-center gap-2 text-accent">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                <span className="text-sm sm:text-base font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-medium">Group Ordering</span>
              </div>
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base font-medium">Fast Pickup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Component */}
      <Menu
        groupMembers={activeGroup?.members || []}
        onSelectCoffee={navigateToCoffeeDetail}
        onSelectPastry={navigateToPastryDetail}
        onToggleFavorite={toggleFavorite}
        isItemFavorited={isItemFavorited}
        excludedAllergens={excludedAllergens}
        onToggleAllergenFilter={toggleAllergenFilter}
        onClearAllergenFilters={clearAllergenFilters}
      />
    </div>
  );
};