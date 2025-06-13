import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Users, Menu as MenuIcon, ShoppingCart, History, Heart } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: none, 1: group, 2: allergen

  useEffect(() => {
    if (!open && onboardingStep === 0) {
      setOnboardingStep(1);
    }
  }, [open]);

  const handleClose = () => {
    setOnboardingStep(0);
    onClose();
  };

  return (
    <>
      {/* Entry Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <Users className="inline-block h-6 w-6 text-primary" />
                Welcome to Group Ordering!
              </span>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                <p className="mb-4 text-muted-foreground">
                  Your first active group is just for you! Customize your allergens in the Groups tab, and create new groups/members as needed! We can automatically filter allergens for you.
                </p>
                <div className="flex flex-col gap-2 text-base">
                  <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> <span>Create or join a group</span></span>
                  <span className="flex items-center gap-2"><MenuIcon className="h-5 w-5 text-primary" /> <span>Add members and set allergens</span></span>
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> <span>Add items to the group cart or assign to members</span></span>
                  <span className="flex items-center gap-2"><History className="h-5 w-5 text-destructive" /> <span>Get notified of allergen conflicts immediately</span></span>
                  <span className="flex items-center gap-2"><Heart className="h-5 w-5 text-success" /> <span>Checkout and enjoy your order!</span></span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={onClose}>Got it!</button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Overlay for onboarding step 1: highlight active group */}
      {onboardingStep === 1 && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-start justify-center" style={{zIndex:99999, pointerEvents:'auto'}}>
          <div className="absolute top-0 left-0 w-full h-full" onClick={handleClose} style={{zIndex:99999, pointerEvents:'auto'}} />
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-8" style={{zIndex:100000, pointerEvents:'auto'}} onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs mx-auto text-center">
              <div className="mb-2 font-bold text-lg">This is where your active group is</div>
              <div className="mb-4 text-sm text-muted-foreground">Control who's in what group, the current active group, and member allergies in the Group Management tab.</div>
              <button className="btn btn-primary" style={{zIndex:100001, pointerEvents:'auto'}} onClick={e => { e.stopPropagation(); setOnboardingStep(2); }}>Next</button>
            </div>
          </div>
        </div>
      )}
      {/* Overlay for onboarding step 2: highlight allergen filter */}
      {onboardingStep === 2 && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-start justify-center" style={{zIndex:99999, pointerEvents:'auto'}}>
          <div className="absolute top-0 left-0 w-full h-full" onClick={handleClose} style={{zIndex:99999, pointerEvents:'auto'}} />
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-32" style={{zIndex:100000, pointerEvents:'auto'}} onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs mx-auto text-center">
              <div className="mb-2 font-bold text-lg">Allergen Filters</div>
              <div className="mb-4 text-sm text-muted-foreground">Once you add a member with an allergy, if they're in the active group, we filter the menu for you. You can clear these as needed.</div>
              {/* AllergenFilter modal integration */}
              {/* Example props, replace with actual state/handlers as needed */}
              {/* <AllergenFilter filtersOpen={true} setFiltersOpen={()=>{}} excludedAllergens={[]} onToggleAllergenFilter={()=>{}} onClearAllergenFilters={()=>{}} allAllergens={[]} groupBasedAllergens={[]} filteredOutCount={0} /> */}
              <button className="btn btn-primary mt-4" style={{zIndex:100001, pointerEvents:'auto'}} onClick={handleClose}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingModal;