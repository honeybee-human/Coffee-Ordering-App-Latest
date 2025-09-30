import React, { useEffect, useState } from 'react';
import { Button } from '@/ui/button';
import { MovingTextBanner } from '@/components/shared/MovingTextBanner';
import { MovingCardBanner } from '@/components/shared/MovingCardBanner';
import { useNavigationStore } from '@/store/useNavigationStore';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/ui/accordion';

export const LandingPage: React.FC = () => {
  const { navigateToMenu } = useNavigationStore();
  const bannerItems = [
    'BE CAREFUL',
    'STAY SAFE',
    'WATCH FOR CROSS CONTAMINATION',
    'SafePlate CARES',
    'ALLERGEN AWARENESS MATTERS',
    'PROTECT YOUR FRIENDS',
    'CHECK INGREDIENTS TWICE',
    'SAFETY FIRST',
    'BE CAREFUL',
    'STAY SAFE',
    'CROSS CONTAMINATION CAN HURT',
    'SafePlate',
  ];

  const initialRestaurants = [
    'SafePlate', 'Harvest Kitchen', 'Urban Spoon', 'Cedar & Sage', 'Golden Grill',
    'Riverstone Bistro', 'Maple & Oak', 'Olive Branch', 'Seaside Table', 'Sunrise Diner',
    'Copper Pot', 'Garden Plate', 'Velvet Fork', 'Stone Hearth', 'Amber Lounge'
  ];
  const [restaurants, setRestaurants] = useState<string[]>(initialRestaurants);


  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <h1 className="text-6xl font-black text-center text-primary mt-[30px] animate-title-pop">SafePlate</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">SafePlate is software for restaurants and people with severe allergies.</p>

      {/* Banner wrapped to reserve space */}
      <div className="w-full">
        <MovingTextBanner items={bannerItems} />
      </div>

      <div className='h-10'></div>


      <div className="max-w-4xl mx-auto text-center space-y-10">
        <p className="text-muted-foreground">
          Welcome to SafePlate - your streamlined coffee and pastry ordering app for groups.
          Create a group, add members, personalize each order with customizations, and keep allergens in check.
        </p>

        {/* Quick Start */}
        <div className="grid gap-3 text-left">
          <div className="relative">
            {/* Absolute rotating asterisk SVG overlapping top-right of instructions box */}
            <svg
              className="absolute -top-6 -right-6 w-24 h-24 text-primary animate-slow-rotate origin-center pointer-events-none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              <line x1="18" y1="18" x2="82" y2="82" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              <line x1="18" y1="82" x2="82" y2="18" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            </svg>
            <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
              <p className="font-medium">How to use:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Go to Groups to create or select an active group.</li>
                <li>Browse Menu and customize items to your liking.</li>
                <li>Assign items to group members to track orders.</li>
                <li>Use allergen filters to avoid cross contamination.</li>
                <li>Review your Cart, then proceed to Checkout.</li>
              </ul>

            </div>
          </div>
          
        </div>
                  <div className="flex items-center justify-center">
        <Button
          size="lg"
          className="m-8 p-8 w-full sm:w-64 text-lg border border-b-2 border-r-2"
          onClick={navigateToMenu}
        >
          View Our Menu
        </Button>
      </div>
        {/* Feature Highlights */}
        <div className='flex flex-col gap-20'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">Group Ordering</p>
            <p className="text-muted-foreground">Create groups and assign items to members for easy coordination.</p>
          </div>
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">Deep Customization</p>
            <p className="text-muted-foreground">Adjust customizations for each item and assign an item to a group member - where another safety check can be applied.</p>
          </div>
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">Allergen Safety</p>
            <p className="text-muted-foreground">Filter allergens and receive warnings to prevent cross contamination.</p>
          </div>
        </div>

{/* Safety First - Enhanced */}
<div className="relative border border-b-2 border-r-2 rounded-[1px] p-8 bg-gradient-to-br from-red-50 to-orange-50">
  {/* Decorative corner element */}
  <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-10 rounded-bl-full"></div>
  
  <p className="font-black text-2xl text-primary mb-4">⚠️ Built-In Safety Checks</p>
  <p className="text-lg mb-4">
    SafePlate automatically tracks allergens across your entire order and alerts you to 
    potential risks before you checkout. No more asking "does this have nuts?" - the app 
    already knows and will warn you.
  </p>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
    <div className="flex items-start gap-3">
      <span className="text-2xl">🔍</span>
      <div>
        <p className="font-semibold">Automatic Allergen Detection</p>
        <p className="text-sm text-muted-foreground">Every item shows allergens instantly—no guessing</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <span className="text-2xl">🚨</span>
      <div>
        <p className="font-semibold">Real-Time Conflict Alerts</p>
        <p className="text-sm text-muted-foreground">Get warned immediately if an item conflicts with your filters</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <span className="text-2xl">👥</span>
      <div>
        <p className="font-semibold">Group-Wide Protection</p>
        <p className="text-sm text-muted-foreground">Track allergies for everyone in your group automatically</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <span className="text-2xl">✅</span>
      <div>
        <p className="font-semibold">Pre-Checkout Verification</p>
        <p className="text-sm text-muted-foreground">Final safety check before your order goes through</p>
      </div>
    </div>
  </div>
</div>

     
        
{/* Why SafePlate Matters - New Section */}
<div className="text-left space-y-6">
  
  <h2 className="font-black text-3xl text-center">Why SafePlate Matters</h2>
     {/* Impact & Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">ER Visit Costs</p>
            <p className="text-muted-foreground">Anaphylaxis ER visits can range from $1,500 to $5,000+</p>
          </div>
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">Annual Family Burden</p>
            <p className="text-muted-foreground">Families may spend $1,000–$4,000 yearly on allergy management</p>
          </div>
          <div className="border border-b-2 border-r-2 rounded-[1px] p-4 bg-white">
            <p className="font-medium">Hidden Costs</p>
            <p className="text-muted-foreground">Specialty foods and replacement items raise monthly expenses</p>
          </div>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="border border-b-2 border-r-2 rounded-[1px] p-6 bg-white">
      <p className="font-bold text-xl mb-3">🏥 The Problem</p>
      <p className="text-muted-foreground">
        Over 200,000 people require emergency care for food allergies annually in the US. 
        Traditional ordering relies on verbal communication that can fail—menus change, 
        staff forget, details get lost in translation.
      </p>
    </div>
    
    <div className="border border-b-2 border-r-2 rounded-[1px] p-6 bg-white">
      <p className="font-bold text-xl mb-3">💡 Our Solution</p>
      <p className="text-muted-foreground">
        SafePlate digitizes the entire process. Set your allergens once, and the system 
        automatically flags conflicts across all menu items, customizations, and group 
        orders. Technology eliminates human error.
      </p>
    </div>
    
    <div className="border border-b-2 border-r-2 rounded-[1px] p-6 bg-white">
      <p className="font-bold text-xl mb-3">🎯 Smart Filtering</p>
      <p className="text-muted-foreground">
        Instead of reading every ingredient list, SafePlate filters the menu for you. 
        Only see items you can safely eat, or choose to view everything with clear 
        warnings on risky choices.
      </p>
    </div>
    
    <div className="border border-b-2 border-r-2 rounded-[1px] p-6 bg-white">
      <p className="font-bold text-xl mb-3">📊 Consistency Guaranteed</p>
      <p className="text-muted-foreground">
        Every order gets the same thorough safety check. No more worrying if the server 
        remembered to tell the kitchen, or if ingredients changed since your last visit. 
        The app knows, and the kitchen receives clear instructions.
      </p>
    </div>
  </div>
</div>



        {/* FAQ as Accordions */}
        <Accordion type="single" collapsible className="w-full text-left">
          <AccordionItem value="item-1">
            <AccordionTrigger>Can I save favorite sets?</AccordionTrigger>
            <AccordionContent>Yes, save a full cart as a favorite and reuse later.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Do I need an active group?</AccordionTrigger>
            <AccordionContent>You can browse freely, but assigning items works best with a group.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do allergen warnings work?</AccordionTrigger>
            <AccordionContent>We highlight conflicts immediately and display warnings when filters detect risks.</AccordionContent>
          </AccordionItem>

          {/* Additional FAQ items */}
          <AccordionItem value="item-4">
            <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
            <AccordionContent>Standard credit/debit cards are supported during checkout.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Can I reorder from my history?</AccordionTrigger>
            <AccordionContent>Yes, use Order History to quickly reorder past sets.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>How do I assign items to members?</AccordionTrigger>
            <AccordionContent>Open a group, add members, then assign items directly from the cart or item detail.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>Do allergen filters update in real-time?</AccordionTrigger>
            <AccordionContent>Yes, adding or changing filters will instantly flag conflicts on items.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger>Are my favorites shareable?</AccordionTrigger>
            <AccordionContent>You can save sets as favorites; sharing features are planned.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-9">
            <AccordionTrigger>Is my data private?</AccordionTrigger>
            <AccordionContent>We prioritize privacy and only store data necessary to process orders.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-10">
            <AccordionTrigger>How do I contact support?</AccordionTrigger>
            <AccordionContent>Use the Contact section for assistance; we’ll respond promptly.</AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bottom: continuously scrolling restaurant cards */}
        <div className="w-full mb-[150px]">
          <p className="text-center font-medium mb-4">Restaurants using our platform</p>
          <MovingCardBanner items={restaurants} />
        </div>

      </div>
    </div>
    </div>
  );
};