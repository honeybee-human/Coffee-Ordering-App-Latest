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
                <p className="mb-4 text-muted-foreground text-sm lg:text-base">
                  An active group is the group of people you are currently ordering for. 
                  Your first active group is set to only be for you! 
                  Each group has its own cart and favorites, and you can filter your order history by group.
                </p>
                <hr/>
                <p className="my-4 text-muted-foreground text-sm lg:text-base">
                  Create new groups and new members as needed, and label each of their allergens.
                  so that we can auto filter and warn you of potential conflicts. To test functionality,
                  add a member who's allergic to blueberries. When a filter is off, you will see a warning chip on a product.
                </p><hr/><br/>
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