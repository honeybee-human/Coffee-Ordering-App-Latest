import React from 'react';
import { Coffee, ShoppingCart, History, Heart, Menu as MenuIcon, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Group, AppState } from '@/types';
import { useGroupsStore } from '@/store/useGroupsStore';

export interface HeaderProps {
  activeGroup?: Group;
  appState: AppState & { groups?: Group[] };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  onNavigateToMenu: () => void;
  onNavigateToCart: () => void;
  onNavigateToGroups: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToOrderHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeGroup,
  appState,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onNavigateToMenu,
  onNavigateToCart,
  onNavigateToGroups,
  onNavigateToFavorites,
  onNavigateToOrderHistory
}) => {
  const navigationItems = [
    {
      icon: Coffee,
      label: 'Menu',
      page: 'menu',
      count: null,
      action: onNavigateToMenu
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      page: 'cart',
      count: activeGroup?.cart.length || 0,
      action: onNavigateToCart,
      isCart: true
    },
    {
      icon: Users,
      label: 'Groups',
      page: 'groups',
      count: null,
      action: onNavigateToGroups
    },
    {
      icon: Heart,
      label: 'Favorites',
      page: 'favorites',
      count: null,
      action: onNavigateToFavorites
    },
    {
      icon: History,
      label: 'Orders',
      page: 'order-history',
      count: null,
      action: onNavigateToOrderHistory
    }
  ];

  return (
    <header className="coffee-header sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between min-h-[60px]">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onNavigateToMenu}
          >
            <div className="p-2 sm:p-3 rounded-xl">
              <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>

          {/* Active Group Display with Dropdown - Hidden on small screens to save space */}
          {activeGroup && (
            <div className="hidden sm:flex items-center text-xs sm:text-sm text-white/80 text-center px-2 sm:px-4 max-w-xs lg:max-w-none truncate">
              <div className="flex items-center gap-2">
                {appState.groups && appState.groups.length > 1 ? (
                  <Select
                    value={activeGroup.id}
                    onValueChange={(value) => {
                      useGroupsStore.getState().selectGroup(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a group">
                        <span className="text-white font-medium">{activeGroup.name}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-sm border-white/20 z-50">
                      {appState.groups.map(group => (
                        <SelectItem 
                          key={group.id} 
                          value={group.id}
                          className="hover:bg-accent/10"
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div 
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onNavigateToGroups}
                  >
                    <span className="text-white font-medium">{activeGroup.name}</span>
                    <ChevronDown className="h-4 w-4 text-white/70" />
                  </div>
                )}
                <span className="hidden md:inline text-white/70"> • {activeGroup.members.length} member{activeGroup.members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.page}
                  variant="ghost"
                  onClick={item.action}
                  className={`nav-button text-white hover:bg-white/20 hover:text-white px-3 xl:px-4 py-2 text-sm ${
                    appState.currentPage === item.page ? 'bg-[#2d1505] text-white' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-1 xl:ml-2 h-5 px-1.5 font-semibold ${
                        item.isCart 
                          ? 'bg-accent text-primary' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Tablet Navigation - Simplified icons only */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.page}
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className={`relative nav-button text-white hover:bg-white/20 hover:text-white p-2 ${
                    appState.currentPage === item.page ? 'bg-[#2d1505] text-white' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.count !== null && item.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs font-semibold flex items-center justify-center ${
                        item.isCart 
                          ? 'bg-accent text-primary' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.count > 99 ? '99+' : item.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white p-2"
                  >
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader className="border-b pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <SheetTitle className="text-left">Bean & Bite</SheetTitle>
                        {activeGroup && (
                          <p className="text-sm text-muted-foreground text-left">
                            {activeGroup.name} • {activeGroup.members.length} member{activeGroup.members.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </SheetHeader>
                  
                  {/* Mobile Navigation Items */}
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.page}
                        variant="ghost"
                        onClick={item.action}
                        className={`w-full justify-start gap-3 p-4 h-auto ${
                          appState.currentPage === item.page 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.count !== null && item.count > 0 && (
                              <Badge 
                                variant="secondary" 
                                className={`h-6 px-2 font-semibold ${
                                  item.isCart 
                                    ? 'bg-accent text-primary' 
                                    : appState.currentPage === item.page
                                      ? 'bg-primary text-white'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {item.count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
