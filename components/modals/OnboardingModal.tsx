import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Users, Menu as MenuIcon, ShoppingCart, History, Heart, HelpCircle } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [modalOpen, setModalOpen] = useState(open);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  useEffect(() => {
    // Show help button after modal is closed
    if (!modalOpen) {
      setShowHelpButton(true);
    }
  }, [modalOpen]);

  const handleClose = () => {
    setModalOpen(false);
    onClose();
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    // Prevent event propagation and default behavior
    e.stopPropagation();
    e.preventDefault();
    setModalOpen(true);
  };

  return (
    <>
      {/* Entry Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) onClose();
      }}>
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
                <p className="my-4 text-muted-foreground text-sm">
                  An active group is the group of people you are currently ordering for.
                  Create new groups and new members as needed, then label each of their allergens.
                  We'll warn you of potential conflicts. 
                 </p> <hr/> <p className="my-4 text-muted-foreground text-sm">To test functionality,
                  your first group member is allergic to blueberries and hazelnuts. When a filter is off, there's a warning chip for their specific allergens. In groups, you can set automatic filters.
                </p><hr/><br/>
                <div className="flex flex-col gap-2 text-base">
                  <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> <span>Create groups and members with set allergens</span></span>
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> <span>Add items to group cart/favorites or assign to specific members</span></span>
                  <span className="flex items-center gap-2"><MenuIcon className="h-5 w-5 text-primary" /> <span>Change a member's groups and see their assigned items follow</span></span>
                  
                  <span className="flex items-center gap-2"><History className="h-5 w-5 text-destructive" /> <span>See allergen conflicts with pop up warnings immediately</span></span>
                  <span className="flex items-center gap-2"><Heart className="h-5 w-5 text-success" /> <span>Check out and enjoy, with the option to order again from history</span></span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={handleClose}>Got it!</button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Floating help button */}
      {showHelpButton && (
        <button 
          onClick={handleOpenModal}
          className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors z-[9999] pointer-events-auto"
          aria-label="Help"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

export default OnboardingModal;