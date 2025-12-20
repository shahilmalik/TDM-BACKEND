import { ServiceCategory, GraphicItem, EcomPlatform } from './types';

// Using string identifiers for icons to map in component
export const ServicesList: ServiceCategory[] = [
  {
    id: 'smm',
    title: 'Social Media Marketing',
    description: 'Build a vibrant community and engage your audience with data-driven social strategies.',
    icon: 'Share2',
    details: ['Platform Management', 'Content Creation', 'Community Engagement', 'Analytics']
  },
  {
    id: 'web',
    title: 'Web Design & Dev',
    description: 'High-performance websites tailored to your brand.',
    icon: 'Monitor',
    details: ['Business Websites', 'E-commerce Stores', 'Landing Pages', 'Portfolios']
  },
  {
    id: 'seo',
    title: 'SEO Services',
    description: 'Rank higher on Google. We optimize your content and technical structure for maximum visibility.',
    icon: 'Search',
    details: ['Keyword Research', 'On-Page Optimization', 'Backlink Building', 'Technical Audit']
  },
  {
    id: 'graphic',
    title: 'Graphic Designing',
    description: 'Visual storytelling that captures attention. From logos to complete brand identity kits.',
    icon: 'PenTool',
    details: ['Logo Creation', 'Package Design', 'Posters & Flyers', 'Business Cards', 'Banners']
  },
  {
    id: 'ecom',
    title: 'E-commerce Solutions',
    description: 'Launch and scale your store on Amazon, Flipkart, or your own custom platform.',
    icon: 'ShoppingBag',
    details: ['Store Setup', 'Product Listing Optimization', 'Inventory Management', 'Marketplace Ads']
  },
  {
    id: 'photography',
    title: 'Photography & Reels',
    description: 'Professional product shoots and viral-ready video content for the modern feed.',
    icon: 'Camera',
    details: ['Product Shoots', 'Real Estate/Property', 'Instagram Reels', 'Corporate Shoots']
  }
];

export const GraphicItems: GraphicItem[] = [
  // Category 1
  {
    id: 'logo',
    title: 'Logo Design',
    description: 'Up to 5 variants and unlimited revisions for the chosen variant until satisfaction.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1626785774573-4b7993143d2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'business_card',
    title: 'Business Card',
    description: 'Professional double-sided card design to leave a lasting impression.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'letterhead',
    title: 'Letterhead & Envelope',
    description: 'Corporate stationery aligned perfectly with your brand identity.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'flyer',
    title: 'Flyer',
    description: 'High-impact single page visuals for events or promotions.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'banner',
    title: 'Banner',
    description: 'Large format print or digital web banners for maximum visibility.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1520697517384-2992824e93bb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'brochure',
    title: 'Brochure / Menu Card',
    description: 'Tri-fold or bi-fold informative assets or restaurant menus.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'calendar',
    title: 'Calendar Design',
    description: 'Branded desk or wall calendars.',
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=300'
  },
  // Category 2
  {
    id: 'packaging',
    title: 'Package Design',
    description: '1 master design, and then designs, size manipulations.',
    category: 'packaging',
    image: 'https://images.unsplash.com/photo-1632515093556-3b6b45a2012a?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'mockup',
    title: 'Mockup Design',
    description: 'Master mockup and manipulation mockups.',
    category: 'packaging',
    image: 'https://images.unsplash.com/photo-1583339793403-3d9b001b6008?auto=format&fit=crop&q=80&w=300'
  }
];

export const EcomPlatforms: EcomPlatform[] = [
  { 
    id: 'amazon', 
    name: 'Amazon', 
    type: 'marketplace',
    domain: 'amazon.in',
    description: 'The world\'s largest marketplace. Gain access to millions of prime customers and leverage FBA for seamless logistics.',
    availableInIndia: true
  },
  { 
    id: 'flipkart', 
    name: 'Flipkart', 
    type: 'marketplace',
    domain: 'flipkart.com',
    description: 'India\'s homegrown e-commerce giant. Essential for reaching tier-2 and tier-3 city demographics effectively.',
    availableInIndia: true
  },
  { 
    id: 'meesho', 
    name: 'Meesho', 
    type: 'marketplace',
    domain: 'meesho.com',
    description: 'Zero commission model perfect for budget-friendly products. Tap into the massive social commerce reseller network.',
    availableInIndia: true
  },
  { 
    id: 'jiomart', 
    name: 'JioMart', 
    type: 'marketplace',
    domain: 'jiomart.com',
    description: 'The fastest growing O2O platform in India, backed by Reliance. Ideal for grocery and daily essential brands.',
    availableInIndia: true
  },
  { 
    id: 'bigbasket', 
    name: 'BigBasket', 
    type: 'marketplace',
    domain: 'bigbasket.com',
    description: 'Leader in online grocery. If you sell food or household essentials, this is the premium shelf space you need.',
    availableInIndia: true
  },
  { 
    id: 'blinkit', 
    name: 'Blinkit', 
    type: 'marketplace',
    domain: 'blinkit.com',
    description: 'Quick commerce is the future. Get your products delivered to customers in minutes, not days.',
    availableInIndia: true
  },
  { 
    id: 'zepto', 
    name: 'Zepto', 
    type: 'marketplace',
    domain: 'zepto.com',
    description: 'Pioneers of 10-minute delivery. Perfect for impulse-buy products and daily necessities in metro cities.',
    availableInIndia: true
  },
  { 
    id: 'swiggy', 
    name: 'Swiggy', 
    type: 'food',
    domain: 'swiggy.com',
    description: 'Dominate the food delivery space. Use ads and offers to appear on top when hungry customers search.',
    availableInIndia: true
  },
  { 
    id: 'zomato', 
    name: 'Zomato', 
    type: 'food',
    domain: 'zomato.com',
    description: 'The go-to app for discovery. Optimize your listing to turn profile visits into high-value orders.',
    availableInIndia: true
  },
  { 
    id: 'ubereats', 
    name: 'UberEats', 
    type: 'food',
    domain: 'ubereats.com',
    description: 'Leverage the global standard in food delivery technology to reach premium customers.',
    availableInIndia: false
  },
  { 
    id: 'foodpanda', 
    name: 'FoodPanda', 
    type: 'food',
    domain: 'foodpanda.com',
    description: 'Expand your reach in specific Asian markets with a strong delivery network.',
    availableInIndia: false
  },
  { 
    id: 'grab', 
    name: 'Grab', 
    type: 'food',
    domain: 'grab.com',
    description: 'The superapp for Southeast Asia. Essential if you are looking to expand your food brand internationally.',
    availableInIndia: false
  },
];