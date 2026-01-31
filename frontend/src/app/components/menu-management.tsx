import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Checkbox } from '@/app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { cn } from '@/app/components/ui/utils';
import { Plus, Edit, Trash2, IndianRupee, Search, Package, Tag, Flame, X, Leaf, Drumstick, Filter, LayoutGrid, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Customization {
  id: string;
  name: string;
  type: 'addon' | 'spicelevel' | 'other';
  options: string[];
  selectedOptions?: string[]; // For tracking selections
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  customizations: Customization[];
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  preparationTime?: number;
  dietType?: 'veg' | 'non-veg';
  offer?: {
    discount: number;
    label: string;
  };
}

interface ComboMeal {
  id: string;
  name: string;
  description: string;
  items: string[];
  originalPrice: number;
  discountedPrice: number;
  image: string;
  available: boolean;
}

export function MenuManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [activeCategory, setActiveCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCombo, setEditingCombo] = useState<ComboMeal | null>(null);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const itemFormRef = useRef<HTMLFormElement>(null);
  const comboFormRef = useRef<HTMLFormElement>(null);

  // Comprehensive menu items with at least 20 items per category
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // APPETIZERS (20 items)
    {
      id: 'app1',
      name: 'Samosa',
      category: 'appetizers',
      price: 40,
      description: 'Crispy fried pastry filled with spiced potatoes and peas',
      image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?w=400',
      available: true,
      customizations: [
        { id: 'c1', name: 'Sauce', options: ['Mint Chutney', 'Tamarind Chutney', 'Both'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 10,
      dietType: 'veg'
    },
    {
      id: 'app2',
      name: 'Spring Rolls',
      category: 'appetizers',
      price: 120,
      description: 'Crispy vegetable spring rolls served with sweet chili sauce',
      image: 'https://images.unsplash.com/photo-1768701544400-dfa8ca509d10?w=400',
      available: true,
      customizations: [
        { id: 'c2', name: 'Quantity', options: ['4 pcs', '6 pcs', '8 pcs'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'app3',
      name: 'Chicken Wings',
      category: 'appetizers',
      price: 280,
      description: 'Spicy chicken wings with buffalo or BBQ sauce',
      image: 'https://images.unsplash.com/photo-1600891964532-839fb6407dd1?w=400',
      available: true,
      customizations: [
        { id: 'c3', name: 'Sauce', options: ['Buffalo', 'BBQ', 'Honey Garlic'] },
        { id: 'c4', name: 'Quantity', options: ['6 pcs', '9 pcs', '12 pcs'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 20,
      dietType: 'non-veg'
    },
    {
      id: 'app4',
      name: 'Paneer Tikka',
      category: 'appetizers',
      price: 240,
      description: 'Marinated cottage cheese grilled to perfection',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
      available: true,
      customizations: [
        { id: 'c5', name: 'Spice Level', options: ['Mild', 'Medium', 'Spicy'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 18,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'app5',
      name: 'Fish Fingers',
      category: 'appetizers',
      price: 320,
      description: 'Crispy fried fish fingers with tartar sauce',
      image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      available: true,
      customizations: [
        { id: 'c6', name: 'Dip', options: ['Tartar Sauce', 'Garlic Mayo', 'Both'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'non-veg'
    },
    {
      id: 'app6',
      name: 'Veg Pakora',
      category: 'appetizers',
      price: 100,
      description: 'Mixed vegetable fritters with mint chutney',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'medium',
      preparationTime: 12,
      dietType: 'veg'
    },
    {
      id: 'app7',
      name: 'Chicken Nuggets',
      category: 'appetizers',
      price: 200,
      description: 'Golden fried chicken nuggets with dipping sauces',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
      available: true,
      customizations: [
        { id: 'c7', name: 'Quantity', options: ['6 pcs', '9 pcs', '12 pcs'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'non-veg',
      offer: { discount: 20, label: 'BUY 1 GET 1' }
    },
    {
      id: 'app8',
      name: 'Hara Bhara Kebab',
      category: 'appetizers',
      price: 180,
      description: 'Spinach and green pea patties with yogurt dip',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'veg'
    },
    {
      id: 'app9',
      name: 'Prawn Tempura',
      category: 'appetizers',
      price: 380,
      description: 'Light and crispy Japanese-style prawns',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      available: true,
      customizations: [
        { id: 'c8', name: 'Sauce', options: ['Soy Sauce', 'Sweet Chili', 'Wasabi Mayo'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 18,
      dietType: 'non-veg'
    },
    {
      id: 'app10',
      name: 'Corn Cheese Balls',
      category: 'appetizers',
      price: 160,
      description: 'Crispy balls filled with corn and melted cheese',
      image: 'https://www.homecookingadventure.com/wp-content/uploads/2023/11/Crispy-Cheese-Balls-main1.webp',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 12,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'app11',
      name: 'Tandoori Chicken',
      category: 'appetizers',
      price: 340,
      description: 'Marinated chicken cooked in tandoor',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
      available: true,
      customizations: [
        { id: 'c9', name: 'Portion', options: ['Quarter', 'Half', 'Full'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 25,
      dietType: 'non-veg'
    },
    {
      id: 'app12',
      name: 'Aloo Tikki',
      category: 'appetizers',
      price: 80,
      description: 'Spiced potato patties with chutneys',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'medium',
      preparationTime: 10,
      dietType: 'veg'
    },
    {
      id: 'app13',
      name: 'Chicken Lollipop',
      category: 'appetizers',
      price: 260,
      description: 'Spicy chicken drumettes in Indo-Chinese style',
      image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      available: true,
      customizations: [
        { id: 'c10', name: 'Spice', options: ['Mild', 'Medium', 'Extra Spicy'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 20,
      dietType: 'non-veg'
    },
    {
      id: 'app14',
      name: 'Mushroom Manchurian',
      category: 'appetizers',
      price: 200,
      description: 'Crispy mushrooms in tangy Manchurian sauce',
      image: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/06/gobi-manchurian-featured.jpg',
      available: true,
      customizations: [
        { id: 'c11', name: 'Sauce Level', options: ['Light', 'Medium', 'Extra'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 15,
      dietType: 'veg',
      offer: { discount: 12, label: '12% OFF' }
    },
    {
      id: 'app15',
      name: 'Calamari Rings',
      category: 'appetizers',
      price: 360,
      description: 'Crispy fried squid rings with aioli',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 18,
      dietType: 'non-veg'
    },
    {
      id: 'app16',
      name: 'Veg Momos',
      category: 'appetizers',
      price: 140,
      description: 'Steamed dumplings with vegetable filling',
      image: 'https://images.unsplash.com/photo-1604908376022-ce3f0115e4c8?w=400',
      available: true,
      customizations: [
        { id: 'c12', name: 'Style', options: ['Steamed', 'Fried', 'Pan Fried'] },
        { id: 'c13', name: 'Quantity', options: ['6 pcs', '8 pcs', '10 pcs'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 15,
      dietType: 'veg'
    },
    {
      id: 'app17',
      name: 'Chicken Momos',
      category: 'appetizers',
      price: 180,
      description: 'Steamed dumplings with minced chicken filling',
      image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
      available: true,
      customizations: [
        { id: 'c14', name: 'Style', options: ['Steamed', 'Fried', 'Pan Fried'] },
        { id: 'c15', name: 'Quantity', options: ['6 pcs', '8 pcs', '10 pcs'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 15,
      dietType: 'non-veg'
    },
    {
      id: 'app18',
      name: 'Onion Rings',
      category: 'appetizers',
      price: 120,
      description: 'Crispy battered onion rings',
      image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
      available: true,
      customizations: [
        { id: 'c16', name: 'Dip', options: ['Ketchup', 'Mayo', 'Ranch', 'All'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 10,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'app19',
      name: 'Chicken Satay',
      category: 'appetizers',
      price: 300,
      description: 'Grilled chicken skewers with peanut sauce',
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'medium',
      preparationTime: 20,
      dietType: 'non-veg'
    },
    {
      id: 'app20',
      name: 'Stuffed Mushrooms',
      category: 'appetizers',
      price: 220,
      description: 'Baked mushrooms stuffed with cheese and herbs',
      image: 'https://images.unsplash.com/photo-1608039799874-8314a257406f?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 18,
      dietType: 'veg'
    },

    // MAIN COURSE (20 items)
    {
      id: 'main1',
      name: 'Butter Chicken',
      category: 'main-course',
      price: 320,
      description: 'Tender chicken in rich, creamy tomato-based curry',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      available: true,
      customizations: [
        { id: 'c17', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] },
        { id: 'c18', name: 'Extra', options: ['Extra Gravy', 'Extra Chicken', 'Extra Butter'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 25,
      dietType: 'non-veg'
    },
    {
      id: 'main2',
      name: 'Chicken Biryani',
      category: 'main-course',
      price: 280,
      description: 'Fragrant basmati rice with tender chicken and aromatic spices',
      image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=400',
      available: true,
      customizations: [
        { id: 'c19', name: 'Side', options: ['Raita', 'Salan', 'Both'] },
        { id: 'c20', name: 'Portion', options: ['Regular', 'Large', 'Family Pack'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 30,
      dietType: 'non-veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'main3',
      name: 'Masala Dosa',
      category: 'main-course',
      price: 150,
      description: 'Crispy South Indian crepe filled with spiced potato masala',
      image: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=400',
      available: true,
      customizations: [
        { id: 'c21', name: 'Accompaniments', options: ['Sambhar', 'Coconut Chutney', 'Both', 'All Three'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 20,
      dietType: 'veg'
    },
    {
      id: 'main4',
      name: 'Margherita Pizza',
      category: 'main-course',
      price: 350,
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      available: true,
      customizations: [
        { id: 'c22', name: 'Size', options: ['Small 8"', 'Medium 10"', 'Large 12"'] },
        { id: 'c23', name: 'Crust', options: ['Thin Crust', 'Regular', 'Thick Crust', 'Cheese Burst'] },
        { id: 'c24', name: 'Extra Toppings', options: ['Extra Cheese', 'Olives', 'Mushrooms', 'Bell Peppers'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 25,
      dietType: 'veg',
      offer: { discount: 20, label: 'BUY 1 GET 1' }
    },
    {
      id: 'main5',
      name: 'Pasta Carbonara',
      category: 'main-course',
      price: 320,
      description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
      image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400',
      available: true,
      customizations: [
        { id: 'c25', name: 'Pasta Type', options: ['Spaghetti', 'Penne', 'Fettuccine'] },
        { id: 'c26', name: 'Add-ons', options: ['Extra Bacon', 'Grilled Chicken', 'Mushrooms'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 20,
      dietType: 'non-veg'
    },
    {
      id: 'main6',
      name: 'Paneer Butter Masala',
      category: 'main-course',
      price: 280,
      description: 'Cottage cheese in rich tomato and cashew gravy',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c27', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 22,
      dietType: 'veg'
    },
    {
      id: 'main7',
      name: 'Fish Curry',
      category: 'main-course',
      price: 380,
      description: 'Fresh fish in tangy coconut-based curry',
      image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      available: true,
      customizations: [
        { id: 'c28', name: 'Side', options: ['Rice', 'Naan', 'Appam'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 28,
      dietType: 'non-veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'main8',
      name: 'Dal Makhani',
      category: 'main-course',
      price: 220,
      description: 'Slow-cooked black lentils with butter and cream',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      available: true,
      customizations: [
        { id: 'c29', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 30,
      dietType: 'veg'
    },
    {
      id: 'main9',
      name: 'Mutton Rogan Josh',
      category: 'main-course',
      price: 420,
      description: 'Aromatic Kashmiri lamb curry with rich spices',
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
      available: true,
      customizations: [
        { id: 'c30', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 35,
      dietType: 'non-veg'
    },
    {
      id: 'main10',
      name: 'Veg Biryani',
      category: 'main-course',
      price: 220,
      description: 'Fragrant basmati rice with mixed vegetables',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
      available: true,
      customizations: [
        { id: 'c31', name: 'Side', options: ['Raita', 'Salan', 'Both'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 28,
      dietType: 'veg'
    },
    {
      id: 'main11',
      name: 'Grilled Chicken Steak',
      category: 'main-course',
      price: 450,
      description: 'Juicy grilled chicken breast with vegetables',
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
      available: true,
      customizations: [
        { id: 'c32', name: 'Side', options: ['Mashed Potatoes', 'French Fries', 'Grilled Veggies', 'Rice'] },
        { id: 'c33', name: 'Sauce', options: ['Mushroom', 'Pepper', 'BBQ', 'None'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 30,
      dietType: 'non-veg'
    },
    {
      id: 'main12',
      name: 'Chole Bhature',
      category: 'main-course',
      price: 180,
      description: 'Spicy chickpea curry with fluffy fried bread',
      image: 'https://www.happy-tummy.co.in/wp-content/uploads/2020/07/Chole-Bhature-scaled.jpg',
      available: true,
      customizations: [
        { id: 'c34', name: 'Quantity', options: ['2 Bhature', '3 Bhature', '4 Bhature'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 20,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'main13',
      name: 'Prawn Masala',
      category: 'main-course',
      price: 480,
      description: 'Succulent prawns in spicy masala gravy',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      available: true,
      customizations: [
        { id: 'c35', name: 'Side', options: ['Rice', 'Naan', 'Appam'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 25,
      dietType: 'non-veg'
    },
    {
      id: 'main14',
      name: 'Palak Paneer',
      category: 'main-course',
      price: 260,
      description: 'Cottage cheese in creamy spinach gravy',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c36', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 22,
      dietType: 'veg'
    },
    {
      id: 'main15',
      name: 'Chicken Tikka Masala',
      category: 'main-course',
      price: 340,
      description: 'Grilled chicken in creamy tomato gravy',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      available: true,
      customizations: [
        { id: 'c37', name: 'Bread', options: ['Naan', 'Roti', 'Paratha', 'Rice'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 25,
      dietType: 'non-veg'
    },
    {
      id: 'main16',
      name: 'Vegetable Hakka Noodles',
      category: 'main-course',
      price: 200,
      description: 'Stir-fried noodles with vegetables',
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
      available: true,
      customizations: [
        { id: 'c38', name: 'Spice', options: ['Mild', 'Medium', 'Spicy'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 18,
      dietType: 'veg'
    },
    {
      id: 'main17',
      name: 'Chicken Hakka Noodles',
      category: 'main-course',
      price: 240,
      description: 'Stir-fried noodles with chicken',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      available: true,
      customizations: [
        { id: 'c39', name: 'Spice', options: ['Mild', 'Medium', 'Spicy'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 20,
      dietType: 'non-veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'main18',
      name: 'Veg Fried Rice',
      category: 'main-course',
      price: 180,
      description: 'Classic fried rice with mixed vegetables',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      available: true,
      customizations: [
        { id: 'c40', name: 'Spice', options: ['Mild', 'Medium', 'Spicy'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'veg'
    },
    {
      id: 'main19',
      name: 'Egg Fried Rice',
      category: 'main-course',
      price: 200,
      description: 'Fried rice with scrambled eggs',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      available: true,
      customizations: [
        { id: 'c41', name: 'Spice', options: ['Mild', 'Medium', 'Spicy'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 15,
      dietType: 'non-veg'
    },
    {
      id: 'main20',
      name: 'Rajma Chawal',
      category: 'main-course',
      price: 160,
      description: 'Red kidney beans curry with steamed rice',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      available: true,
      customizations: [
        { id: 'c42', name: 'Portion', options: ['Regular', 'Large'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 25,
      dietType: 'veg'
    },

    // DESSERTS (20 items)
    {
      id: 'des1',
      name: 'Gulab Jamun',
      category: 'desserts',
      price: 80,
      description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
      image: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=400',
      available: true,
      customizations: [
        { id: 'c43', name: 'Quantity', options: ['2 pcs', '4 pcs', '6 pcs'] },
        { id: 'c44', name: 'Temperature', options: ['Warm', 'Room Temperature'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des2',
      name: 'Chocolate Brownie',
      category: 'desserts',
      price: 120,
      description: 'Rich, fudgy chocolate brownie with vanilla ice cream',
      image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?w=400',
      available: true,
      customizations: [
        { id: 'c45', name: 'Add-ons', options: ['Vanilla Ice Cream', 'Chocolate Sauce', 'Both', 'None'] },
        { id: 'c46', name: 'Serve', options: ['Warm', 'Cold'] }
      ],
      preparationTime: 10,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'des3',
      name: 'Ice Cream Sundae',
      category: 'desserts',
      price: 150,
      description: 'Three scoops of ice cream with toppings and whipped cream',
      image: 'https://images.unsplash.com/photo-1657225953401-5f95007fc8e0?w=400',
      available: true,
      customizations: [
        { id: 'c47', name: 'Flavors', options: ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Mixed'] },
        { id: 'c48', name: 'Toppings', options: ['Chocolate Chips', 'Nuts', 'Sprinkles', 'Fresh Fruits', 'All'] }
      ],
      preparationTime: 8,
      dietType: 'veg'
    },
    {
      id: 'des4',
      name: 'Cheesecake',
      category: 'desserts',
      price: 180,
      description: 'Creamy New York style cheesecake with berry compote',
      image: 'https://images.unsplash.com/photo-1707528903686-91cbbe2f2985?w=400',
      available: true,
      customizations: [
        { id: 'c49', name: 'Topping', options: ['Berry Compote', 'Caramel', 'Chocolate', 'Plain'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des5',
      name: 'Rasmalai',
      category: 'desserts',
      price: 100,
      description: 'Soft cottage cheese patties in sweetened milk',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c50', name: 'Quantity', options: ['2 pcs', '4 pcs', '6 pcs'] }
      ],
      preparationTime: 5,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'des6',
      name: 'Tiramisu',
      category: 'desserts',
      price: 200,
      description: 'Italian coffee-flavored dessert with mascarpone',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      available: true,
      customizations: [],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des7',
      name: 'Kheer',
      category: 'desserts',
      price: 90,
      description: 'Traditional rice pudding with cardamom',
      image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
      available: true,
      customizations: [
        { id: 'c51', name: 'Temperature', options: ['Warm', 'Chilled'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des8',
      name: 'Apple Pie',
      category: 'desserts',
      price: 140,
      description: 'Classic apple pie with cinnamon',
      image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400',
      available: true,
      customizations: [
        { id: 'c52', name: 'Add-on', options: ['Vanilla Ice Cream', 'Whipped Cream', 'Both', 'None'] }
      ],
      preparationTime: 10,
      dietType: 'veg'
    },
    {
      id: 'des9',
      name: 'Chocolate Lava Cake',
      category: 'desserts',
      price: 160,
      description: 'Molten chocolate cake with liquid center',
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      available: true,
      customizations: [
        { id: 'c53', name: 'Add-on', options: ['Vanilla Ice Cream', 'Chocolate Sauce', 'Both'] }
      ],
      preparationTime: 12,
      dietType: 'veg',
      offer: { discount: 20, label: 'BESTSELLER' }
    },
    {
      id: 'des10',
      name: 'Gajar Halwa',
      category: 'desserts',
      price: 110,
      description: 'Carrot-based sweet pudding with nuts',
      image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      available: true,
      customizations: [
        { id: 'c54', name: 'Temperature', options: ['Warm', 'Room Temperature'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des11',
      name: 'Rasgulla',
      category: 'desserts',
      price: 85,
      description: 'Spongy cottage cheese balls in sugar syrup',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c55', name: 'Quantity', options: ['3 pcs', '6 pcs', '9 pcs'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des12',
      name: 'Panna Cotta',
      category: 'desserts',
      price: 170,
      description: 'Italian cream dessert with berry sauce',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      available: true,
      customizations: [
        { id: 'c56', name: 'Flavor', options: ['Vanilla', 'Strawberry', 'Mango'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des13',
      name: 'Jalebi',
      category: 'desserts',
      price: 70,
      description: 'Crispy spiral-shaped sweet soaked in syrup',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c57', name: 'Temperature', options: ['Warm', 'Room Temperature'] }
      ],
      preparationTime: 5,
      dietType: 'veg',
      offer: { discount: 12, label: '12% OFF' }
    },
    {
      id: 'des14',
      name: 'Chocolate Mousse',
      category: 'desserts',
      price: 150,
      description: 'Light and airy chocolate dessert',
      image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=400',
      available: true,
      customizations: [],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des15',
      name: 'Kulfi',
      category: 'desserts',
      price: 60,
      description: 'Traditional Indian ice cream on stick',
      image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?w=400',
      available: true,
      customizations: [
        { id: 'c58', name: 'Flavor', options: ['Malai', 'Mango', 'Pista', 'Kesar'] }
      ],
      preparationTime: 3,
      dietType: 'veg'
    },
    {
      id: 'des16',
      name: 'Tres Leches Cake',
      category: 'desserts',
      price: 190,
      description: 'Sponge cake soaked in three types of milk',
      image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
      available: true,
      customizations: [],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des17',
      name: 'Shrikhand',
      category: 'desserts',
      price: 95,
      description: 'Sweetened strained yogurt with saffron',
      image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
      available: true,
      customizations: [
        { id: 'c59', name: 'Flavor', options: ['Plain', 'Mango', 'Kesar'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'des18',
      name: 'Fruit Salad',
      category: 'desserts',
      price: 120,
      description: 'Fresh seasonal fruits with honey',
      image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
      available: true,
      customizations: [
        { id: 'c60', name: 'Add-on', options: ['Ice Cream', 'Whipped Cream', 'Both', 'None'] }
      ],
      preparationTime: 8,
      dietType: 'veg'
    },
    {
      id: 'des19',
      name: 'Bread Pudding',
      category: 'desserts',
      price: 130,
      description: 'Baked bread pudding with raisins',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyblkJnog4KsaYdt49le8s6spr_rtDB6d-lQ&s',
      available: true,
      customizations: [
        { id: 'c61', name: 'Serve', options: ['Warm', 'Cold'] }
      ],
      preparationTime: 10,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'des20',
      name: 'Mango Sorbet',
      category: 'desserts',
      price: 110,
      description: 'Refreshing mango ice dessert',
      image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
      available: true,
      customizations: [],
      preparationTime: 5,
      dietType: 'veg'
    },

    // BEVERAGES (20 items)
    {
      id: 'bev1',
      name: 'Mango Lassi',
      category: 'beverages',
      price: 90,
      description: 'Refreshing yogurt-based drink with sweet mango pulp',
      image: 'https://images.unsplash.com/photo-1655074084308-901ea6b88fd3?w=400',
      available: true,
      customizations: [
        { id: 'c62', name: 'Size', options: ['Regular', 'Large'] },
        { id: 'c63', name: 'Sweetness', options: ['Less Sweet', 'Normal', 'Extra Sweet'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev2',
      name: 'Fresh Juice',
      category: 'beverages',
      price: 100,
      description: 'Freshly squeezed seasonal fruit juice',
      image: 'https://images.unsplash.com/photo-1707569517904-92b134ff5f69?w=400',
      available: true,
      customizations: [
        { id: 'c64', name: 'Fruit', options: ['Orange', 'Apple', 'Watermelon', 'Pineapple', 'Mixed Fruit'] },
        { id: 'c65', name: 'Size', options: ['Regular', 'Large'] }
      ],
      preparationTime: 5,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'bev3',
      name: 'Coffee Latte',
      category: 'beverages',
      price: 120,
      description: 'Smooth espresso with steamed milk and light foam',
      image: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400',
      available: true,
      customizations: [
        { id: 'c66', name: 'Size', options: ['Small', 'Medium', 'Large'] },
        { id: 'c67', name: 'Milk', options: ['Regular', 'Skim', 'Almond', 'Soy'] },
        { id: 'c68', name: 'Flavor', options: ['None', 'Vanilla', 'Caramel', 'Hazelnut'] }
      ],
      preparationTime: 8,
      dietType: 'veg'
    },
    {
      id: 'bev4',
      name: 'Masala Chai',
      category: 'beverages',
      price: 50,
      description: 'Traditional Indian tea with aromatic spices',
      image: 'https://images.unsplash.com/photo-1698619952010-3bc850cbcb3b?w=400',
      available: true,
      customizations: [
        { id: 'c69', name: 'Type', options: ['Regular', 'Strong', 'Light'] },
        { id: 'c70', name: 'Sweetness', options: ['No Sugar', 'Less Sweet', 'Normal', 'Extra Sweet'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev5',
      name: 'Cold Coffee',
      category: 'beverages',
      price: 130,
      description: 'Chilled coffee with ice cream',
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
      available: true,
      customizations: [
        { id: 'c71', name: 'Size', options: ['Regular', 'Large'] }
      ],
      preparationTime: 8,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'bev6',
      name: 'Green Tea',
      category: 'beverages',
      price: 80,
      description: 'Healthy antioxidant-rich tea',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      available: true,
      customizations: [
        { id: 'c72', name: 'Flavor', options: ['Plain', 'Lemon', 'Honey', 'Mint'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev7',
      name: 'Mojito',
      category: 'beverages',
      price: 110,
      description: 'Refreshing mint and lime mocktail',
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      available: true,
      customizations: [
        { id: 'c73', name: 'Flavor', options: ['Classic', 'Strawberry', 'Blue Curacao', 'Watermelon'] }
      ],
      preparationTime: 7,
      dietType: 'veg'
    },
    {
      id: 'bev8',
      name: 'Cappuccino',
      category: 'beverages',
      price: 110,
      description: 'Espresso with steamed milk and foam',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
      available: true,
      customizations: [
        { id: 'c74', name: 'Size', options: ['Small', 'Medium', 'Large'] }
      ],
      preparationTime: 8,
      dietType: 'veg'
    },
    {
      id: 'bev9',
      name: 'Smoothie',
      category: 'beverages',
      price: 140,
      description: 'Blended fruit smoothie',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
      available: true,
      customizations: [
        { id: 'c75', name: 'Flavor', options: ['Mango', 'Strawberry', 'Mixed Berry', 'Banana'] }
      ],
      preparationTime: 6,
      dietType: 'veg',
      offer: { discount: 12, label: '12% OFF' }
    },
    {
      id: 'bev10',
      name: 'Buttermilk',
      category: 'beverages',
      price: 60,
      description: 'Spiced yogurt-based drink',
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400',
      available: true,
      customizations: [
        { id: 'c76', name: 'Type', options: ['Sweet', 'Salted'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev11',
      name: 'Espresso',
      category: 'beverages',
      price: 90,
      description: 'Strong concentrated coffee',
      image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
      available: true,
      customizations: [
        { id: 'c77', name: 'Type', options: ['Single Shot', 'Double Shot'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev12',
      name: 'Hot Chocolate',
      category: 'beverages',
      price: 100,
      description: 'Rich creamy hot chocolate',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400',
      available: true,
      customizations: [
        { id: 'c78', name: 'Size', options: ['Small', 'Medium', 'Large'] },
        { id: 'c79', name: 'Add-on', options: ['Marshmallows', 'Whipped Cream', 'Both'] }
      ],
      preparationTime: 8,
      dietType: 'veg'
    },
    {
      id: 'bev13',
      name: 'Iced Tea',
      category: 'beverages',
      price: 85,
      description: 'Chilled sweetened tea',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      available: true,
      customizations: [
        { id: 'c80', name: 'Flavor', options: ['Lemon', 'Peach', 'Green Tea'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev14',
      name: 'Milkshake',
      category: 'beverages',
      price: 150,
      description: 'Thick creamy milkshake',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
      available: true,
      customizations: [
        { id: 'c81', name: 'Flavor', options: ['Chocolate', 'Vanilla', 'Strawberry', 'Butterscotch', 'Oreo'] }
      ],
      preparationTime: 8,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'bev15',
      name: 'Lemonade',
      category: 'beverages',
      price: 70,
      description: 'Fresh lemon juice with mint',
      image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f1b?w=400',
      available: true,
      customizations: [
        { id: 'c82', name: 'Type', options: ['Sweet', 'Salted', 'Mint'] }
      ],
      preparationTime: 5,
      dietType: 'veg'
    },
    {
      id: 'bev16',
      name: 'Americano',
      category: 'beverages',
      price: 95,
      description: 'Espresso with hot water',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      available: true,
      customizations: [
        { id: 'c83', name: 'Size', options: ['Small', 'Medium', 'Large'] }
      ],
      preparationTime: 6,
      dietType: 'veg'
    },
    {
      id: 'bev17',
      name: 'Virgin Pina Colada',
      category: 'beverages',
      price: 130,
      description: 'Tropical pineapple coconut mocktail',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
      available: true,
      customizations: [],
      preparationTime: 7,
      dietType: 'veg'
    },
    {
      id: 'bev18',
      name: 'Coconut Water',
      category: 'beverages',
      price: 60,
      description: 'Fresh tender coconut water',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
      available: true,
      customizations: [],
      preparationTime: 2,
      dietType: 'veg'
    },
    {
      id: 'bev19',
      name: 'Badam Milk',
      category: 'beverages',
      price: 100,
      description: 'Almond-flavored milk drink',
      image: 'https://img-cdn.publive.online/fit-in/1200x675/sanjeev-kapoor/media/post_banners/7a6f82b8f824f5dae6cf7a515e0b498e189267778f63fe7742d1fca6da678df6.jpg',
      available: true,
      customizations: [
        { id: 'c84', name: 'Temperature', options: ['Hot', 'Cold'] }
      ],
      preparationTime: 6,
      dietType: 'veg',
      offer: { discount: 8, label: '8% OFF' }
    },
    {
      id: 'bev20',
      name: 'Thandai',
      category: 'beverages',
      price: 110,
      description: 'Traditional spiced milk drink',
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400',
      available: true,
      customizations: [
        { id: 'c85', name: 'Temperature', options: ['Chilled', 'Room Temperature'] }
      ],
      preparationTime: 7,
      dietType: 'veg'
    },

    // SPECIALS (20 items)
    {
      id: 'spe1',
      name: 'Tandoori Platter',
      category: 'specials',
      price: 650,
      description: 'Assorted tandoori delicacies including chicken, paneer, and kebabs',
      image: 'https://images.unsplash.com/photo-1687020835890-b0b8c6a04613?w=400',
      available: true,
      customizations: [
        { id: 'c86', name: 'Accompaniments', options: ['Naan', 'Mint Chutney', 'Onion Salad', 'All'] },
        { id: 'c87', name: 'Portion', options: ['Regular (Serves 2)', 'Large (Serves 4)'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 35,
      dietType: 'non-veg',
      offer: { discount: 20, label: 'CHEF SPECIAL' }
    },
    {
      id: 'spe2',
      name: 'Seafood Platter',
      category: 'specials',
      price: 850,
      description: 'Premium seafood selection with prawns, fish, and calamari',
      image: 'https://images.unsplash.com/photo-1763647738062-d83e44328a6f?w=400',
      available: true,
      customizations: [
        { id: 'c88', name: 'Preparation', options: ['Grilled', 'Fried', 'Mixed'] },
        { id: 'c89', name: 'Side', options: ['French Fries', 'Garlic Bread', 'Lemon Rice', 'All'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 40,
      dietType: 'non-veg'
    },
    {
      id: 'spe3',
      name: 'Royal Thali',
      category: 'specials',
      price: 450,
      description: 'Traditional Indian platter with assorted curries and breads',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [
        { id: 'c90', name: 'Type', options: ['Veg Thali', 'Non-Veg Thali'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 30,
      dietType: 'veg',
      offer: { discount: 15, label: '15% OFF' }
    },
    {
      id: 'spe4',
      name: 'BBQ Ribs',
      category: 'specials',
      price: 680,
      description: 'Slow-cooked pork ribs with BBQ sauce',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      available: true,
      customizations: [
        { id: 'c91', name: 'Side', options: ['Coleslaw', 'French Fries', 'Corn', 'All'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 45,
      dietType: 'non-veg'
    },
    {
      id: 'spe5',
      name: 'Lobster Thermidor',
      category: 'specials',
      price: 1200,
      description: 'Grilled lobster in creamy sauce',
      image: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400',
      available: true,
      customizations: [
        { id: 'c92', name: 'Side', options: ['Garlic Bread', 'Rice', 'Vegetables'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 50,
      dietType: 'non-veg',
      offer: { discount: 25, label: 'LUXURY SPECIAL' }
    },
    {
      id: 'spe6',
      name: 'Paneer Tikka Platter',
      category: 'specials',
      price: 420,
      description: 'Assorted paneer preparations',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
      available: true,
      customizations: [
        { id: 'c93', name: 'Accompaniments', options: ['Naan', 'Mint Chutney', 'Salad', 'All'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 30,
      dietType: 'veg'
    },
    {
      id: 'spe7',
      name: 'Sushi Platter',
      category: 'specials',
      price: 780,
      description: 'Assorted sushi rolls with wasabi and ginger',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      available: true,
      customizations: [
        { id: 'c94', name: 'Type', options: ['Vegetarian', 'Non-Veg', 'Mixed'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 35,
      dietType: 'non-veg',
      offer: { discount: 18, label: '18% OFF' }
    },
    {
      id: 'spe8',
      name: 'Hyderabadi Dum Biryani',
      category: 'specials',
      price: 520,
      description: 'Authentic Hyderabadi style biryani cooked in sealed pot',
      image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=400',
      available: true,
      customizations: [
        { id: 'c95', name: 'Type', options: ['Chicken', 'Mutton', 'Veg'] },
        { id: 'c96', name: 'Side', options: ['Raita', 'Salan', 'Boiled Egg', 'All'] }
      ],
      spiceLevel: 'hot',
      preparationTime: 45,
      dietType: 'non-veg'
    },
    {
      id: 'spe9',
      name: 'Cheese Fondue',
      category: 'specials',
      price: 580,
      description: 'Melted cheese with bread and vegetables for dipping',
      image: 'https://images.unsplash.com/photo-1585238341710-97f3e97370fe?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 25,
      dietType: 'veg'
    },
    {
      id: 'spe10',
      name: 'Mediterranean Mezze Platter',
      category: 'specials',
      price: 490,
      description: 'Hummus, falafel, pita, olives, and more',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'mild',
      preparationTime: 20,
      dietType: 'veg',
      offer: { discount: 10, label: '10% OFF' }
    },
    {
      id: 'spe11',
      name: 'Prime Rib Steak',
      category: 'specials',
      price: 950,
      description: 'Premium cut beef steak cooked to perfection',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
      available: true,
      customizations: [
        { id: 'c97', name: 'Doneness', options: ['Rare', 'Medium Rare', 'Medium', 'Well Done'] },
        { id: 'c98', name: 'Side', options: ['Mashed Potatoes', 'Grilled Veggies', 'French Fries'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 35,
      dietType: 'non-veg'
    },
    {
      id: 'spe12',
      name: 'Dim Sum Basket',
      category: 'specials',
      price: 420,
      description: 'Assorted steamed dumplings',
      image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
      available: true,
      customizations: [
        { id: 'c99', name: 'Type', options: ['Veg', 'Chicken', 'Prawn', 'Mixed'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 25,
      dietType: 'non-veg'
    },
    {
      id: 'spe13',
      name: 'Punjabi Lasagna',
      category: 'specials',
      price: 480,
      description: 'Fusion lasagna with Indian spices',
      image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
      available: true,
      customizations: [
        { id: 'c100', name: 'Type', options: ['Veg', 'Chicken'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 30,
      dietType: 'veg',
      offer: { discount: 20, label: 'FUSION SPECIAL' }
    },
    {
      id: 'spe14',
      name: 'Gourmet Burger Combo',
      category: 'specials',
      price: 380,
      description: 'Artisan burger with fries and drink',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      available: true,
      customizations: [
        { id: 'c101', name: 'Patty', options: ['Chicken', 'Veg', 'Mutton'] },
        { id: 'c102', name: 'Cheese', options: ['None', 'Single', 'Double'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 20,
      dietType: 'non-veg'
    },
    {
      id: 'spe15',
      name: 'Teppanyaki',
      category: 'specials',
      price: 720,
      description: 'Japanese grilled vegetables and protein on hot plate',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      available: true,
      customizations: [
        { id: 'c103', name: 'Protein', options: ['Chicken', 'Prawn', 'Tofu', 'Mixed'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 30,
      dietType: 'non-veg'
    },
    {
      id: 'spe16',
      name: 'Rajasthani Thali',
      category: 'specials',
      price: 520,
      description: 'Royal Rajasthani cuisine platter',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true,
      customizations: [],
      spiceLevel: 'medium',
      preparationTime: 35,
      dietType: 'veg',
      offer: { discount: 15, label: 'ROYAL SPECIAL' }
    },
    {
      id: 'spe17',
      name: 'Paella',
      category: 'specials',
      price: 680,
      description: 'Spanish rice dish with seafood',
      image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400',
      available: true,
      customizations: [
        { id: 'c104', name: 'Type', options: ['Seafood', 'Chicken', 'Vegetarian'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 40,
      dietType: 'non-veg'
    },
    {
      id: 'spe18',
      name: 'Peking Duck',
      category: 'specials',
      price: 880,
      description: 'Crispy duck with pancakes and hoisin sauce',
      image: 'https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=400',
      available: true,
      customizations: [
        { id: 'c105', name: 'Portion', options: ['Half', 'Full'] }
      ],
      spiceLevel: 'mild',
      preparationTime: 50,
      dietType: 'non-veg',
      offer: { discount: 22, label: '22% OFF' }
    },
    {
      id: 'spe19',
      name: 'Nachos Grande',
      category: 'specials',
      price: 340,
      description: 'Loaded nachos with cheese, salsa, and guacamole',
      image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400',
      available: true,
      customizations: [
        { id: 'c106', name: 'Add-on', options: ['Jalapenos', 'Sour Cream', 'Chicken', 'All'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 15,
      dietType: 'veg'
    },
    {
      id: 'spe20',
      name: 'Kerala Fish Moilee',
      category: 'specials',
      price: 520,
      description: 'Fish in coconut milk with Kerala spices',
      image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      available: true,
      customizations: [
        { id: 'c107', name: 'Side', options: ['Appam', 'Rice', 'Parotta'] }
      ],
      spiceLevel: 'medium',
      preparationTime: 32,
      dietType: 'non-veg'
    }
  ]);

  const [comboMeals, setComboMeals] = useState<ComboMeal[]>([
    {
      id: 'combo1',
      name: 'Family Feast Combo',
      description: 'Butter Chicken + Biryani + 4 Naan + Gulab Jamun + 4 Lassi',
      items: ['main1', 'main2', 'des1', 'bev1'],
      originalPrice: 1200,
      discountedPrice: 999,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      available: true
    },
    {
      id: 'combo2',
      name: 'Pizza Party Combo',
      description: '2 Large Pizzas + Chicken Wings + 4 Beverages',
      items: ['main4', 'app3'],
      originalPrice: 1100,
      discountedPrice: 899,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      available: true
    },
    {
      id: 'combo3',
      name: 'Sweet Tooth Combo',
      description: 'Gulab Jamun + Brownie + Ice Cream Sundae + Cheesecake',
      items: ['des1', 'des2', 'des3', 'des4'],
      originalPrice: 530,
      discountedPrice: 449,
      image: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=400',
      available: true
    },
    {
      id: 'combo4',
      name: 'Vegetarian Delight Combo',
      description: 'Paneer Butter Masala + Veg Biryani + Naan + Raita + Gulab Jamun',
      items: ['main6', 'main10', 'des1'],
      originalPrice: 720,
      discountedPrice: 599,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true
    },
    {
      id: 'combo5',
      name: 'Quick Lunch Combo',
      description: 'Masala Dosa + Sambar + Coconut Chutney + Lassi',
      items: ['main3', 'bev1'],
      originalPrice: 240,
      discountedPrice: 199,
      image: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=400',
      available: true
    },
    {
      id: 'combo6',
      name: 'Chinese Festival Combo',
      description: 'Veg Hakka Noodles + Chicken Fried Rice + Spring Rolls + Manchurian',
      items: ['main16', 'main19', 'app2', 'app14'],
      originalPrice: 740,
      discountedPrice: 599,
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
      available: true
    },
    {
      id: 'combo7',
      name: 'Biryani Bonanza Combo',
      description: 'Chicken Biryani + Mutton Rogan Josh + Raita + Salad + Gulab Jamun',
      items: ['main2', 'main9', 'des1'],
      originalPrice: 1020,
      discountedPrice: 849,
      image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=400',
      available: true
    },
    {
      id: 'combo8',
      name: 'Starter Party Combo',
      description: 'Samosa + Paneer Tikka + Spring Rolls + Veg Pakora + 2 Chutneys',
      items: ['app1', 'app4', 'app2', 'app6'],
      originalPrice: 580,
      discountedPrice: 479,
      image: 'https://images.unsplash.com/photo-1697155836252-d7f969108b5a?w=400',
      available: true
    },
    {
      id: 'combo9',
      name: 'Non-Veg Feast Combo',
      description: 'Tandoori Chicken + Chicken Wings + Fish Fingers + 2 Dips',
      items: ['app11', 'app3', 'app5'],
      originalPrice: 940,
      discountedPrice: 799,
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
      available: true
    },
    {
      id: 'combo10',
      name: 'Breakfast Special Combo',
      description: 'Masala Dosa + Idli + Vada + Sambhar + 3 Chutneys + Coffee',
      items: ['main3', 'bev3'],
      originalPrice: 290,
      discountedPrice: 249,
      image: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=400',
      available: true
    },
    {
      id: 'combo11',
      name: 'Tandoori Special Combo',
      description: 'Tandoori Platter + Butter Naan + Mint Chutney + Onion Salad',
      items: ['spe1'],
      originalPrice: 780,
      discountedPrice: 649,
      image: 'https://images.unsplash.com/photo-1687020835890-b0b8c6a04613?w=400',
      available: true
    },
    {
      id: 'combo12',
      name: 'Seafood Extravaganza Combo',
      description: 'Prawn Masala + Fish Curry + Calamari Rings + Rice + 2 Naan',
      items: ['main13', 'main7', 'app15'],
      originalPrice: 1220,
      discountedPrice: 999,
      image: 'https://images.unsplash.com/photo-1763647738062-d83e44328a6f?w=400',
      available: true
    },
    {
      id: 'combo13',
      name: 'Dessert Heaven Combo',
      description: 'Chocolate Lava Cake + Rasmalai + Kulfi + Ice Cream Sundae',
      items: ['des9', 'des5', 'des15', 'des3'],
      originalPrice: 520,
      discountedPrice: 429,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      available: true
    },
    {
      id: 'combo14',
      name: 'Coffee Lovers Combo',
      description: 'Cappuccino + Latte + Brownie + Cheesecake',
      items: ['bev4', 'bev3', 'des2', 'des4'],
      originalPrice: 570,
      discountedPrice: 479,
      image: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400',
      available: true
    },
    {
      id: 'combo15',
      name: 'Curry & Rice Combo',
      description: 'Dal Makhani + Paneer Butter Masala + Jeera Rice + Naan + Pickle',
      items: ['main8', 'main6'],
      originalPrice: 600,
      discountedPrice: 499,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      available: true
    },
    {
      id: 'combo16',
      name: 'Pasta Paradise Combo',
      description: 'Pasta Carbonara + Margherita Pizza + Garlic Bread + Soft Drink',
      items: ['main5', 'main4', 'bev8'],
      originalPrice: 790,
      discountedPrice: 649,
      image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=400',
      available: true
    },
    {
      id: 'combo17',
      name: 'Street Food Combo',
      description: 'Chole Bhature + Pav Bhaji + Aloo Tikki + Lassi',
      items: ['main12', 'app12', 'bev1'],
      originalPrice: 330,
      discountedPrice: 279,
      image: 'https://images.unsplash.com/photo-1626074353765-517a7b1e94d7?w=400',
      available: true
    },
    {
      id: 'combo18',
      name: 'Healthy Bowl Combo',
      description: 'Grilled Chicken Steak + Fresh Juice + Fruit Salad',
      items: ['main11', 'bev2', 'des18'],
      originalPrice: 670,
      discountedPrice: 549,
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
      available: true
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Items', icon: Package, description: 'Complete menu' },
    { id: 'appetizers', name: 'Appetizers', icon: Tag, description: 'Starters' },
    { id: 'main-course', name: 'Main Course', icon: Flame, description: 'Principals' },
    { id: 'desserts', name: 'Desserts', icon: Package, description: 'Sweets' },
    { id: 'beverages', name: 'Beverages', icon: Tag, description: 'Drinks' },
    { id: 'specials', name: 'Specials', icon: Sparkles, description: 'Chef\'s picks' }
  ];

  // Enhanced filtering with search priority and offers filter
  const filteredItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesDiet = dietFilter === 'all' || item.dietType === dietFilter;
      const matchesOffer = !showOffersOnly || item.offer;
      return matchesSearch && matchesCategory && matchesDiet && matchesOffer;
    })
    .sort((a, b) => {
      // Priority 1: Search matches in name (exact matches first)
      if (searchQuery) {
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
      }
      // Priority 2: Available items first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      // Priority 3: Items with offers
      if (a.offer && !b.offer) return -1;
      if (!a.offer && b.offer) return 1;
      return 0;
    });

  const handleAddItem = (formData: FormData) => {
    const customizationsData = customizations.length > 0 ? customizations : [];
    
    const offerDiscount = formData.get('offerDiscount') as string;
    const offerLabel = formData.get('offerLabel') as string;
    
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      available: true,
      customizations: customizationsData,
      spiceLevel: formData.get('spiceLevel') as any,
      preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
      dietType: formData.get('dietType') as any,
      offer: offerDiscount && offerLabel ? {
        discount: parseFloat(offerDiscount),
        label: offerLabel
      } : undefined
    };
    setMenuItems([...menuItems, newItem]);
    setDialogOpen(false);
    setCustomizations([]);
    
    // Clear the form
    if (itemFormRef.current) {
      itemFormRef.current.reset();
    }
    
    // Mobile-style notification
    toast.success('✅ Item Added Successfully!', {
      description: `${newItem.name} has been added to the menu`,
      duration: 3000,
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setCustomizations(item.customizations || []);
    setDialogOpen(true);
  };

  const handleUpdateItem = (formData: FormData) => {
    if (!editingItem) return;
    
    const offerDiscount = formData.get('offerDiscount') as string;
    const offerLabel = formData.get('offerLabel') as string;
    
    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            price: parseFloat(formData.get('price') as string),
            description: formData.get('description') as string,
            image: formData.get('image') as string || item.image,
            spiceLevel: formData.get('spiceLevel') as any,
            preparationTime: parseInt(formData.get('preparationTime') as string),
            dietType: formData.get('dietType') as any,
            customizations: customizations,
            offer: offerDiscount && offerLabel ? {
              discount: parseFloat(offerDiscount),
              label: offerLabel
            } : undefined
          }
        : item
    );
    setMenuItems(updatedItems);
    setDialogOpen(false);
    setEditingItem(null);
    setCustomizations([]);
    
    // Mobile-style notification
    toast.success('✨ Item Updated!', {
      description: `${formData.get('name')} has been updated`,
      duration: 3000,
    });
  };

  const handleDeleteItem = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    setMenuItems(menuItems.filter(item => item.id !== id));
    
    // Mobile-style notification
    toast.error('🗑️ Item Deleted', {
      description: `${item?.name} has been removed from the menu`,
      duration: 3000,
    });
  };

  const handleToggleAvailability = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    const newAvailability = !item?.available;
    
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
    
    // Mobile-style notification with different messages
    if (newAvailability) {
      toast.success('✅ Item Available', {
        description: `${item?.name} is now available for ordering`,
        duration: 3000,
      });
    } else {
      toast.warning('⛔ Item Unavailable', {
        description: `${item?.name} is now marked as unavailable`,
        duration: 3000,
      });
    }
  };

  const handleAddCombo = (formData: FormData) => {
    const offerDiscount = formData.get('comboDiscount') as string;
    
    const newCombo: ComboMeal = {
      id: Date.now().toString(),
      name: formData.get('comboName') as string,
      description: formData.get('comboDescription') as string,
      items: [],
      originalPrice: parseFloat(formData.get('originalPrice') as string),
      discountedPrice: parseFloat(formData.get('discountedPrice') as string),
      image: formData.get('comboImage') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      available: true
    };
    setComboMeals([...comboMeals, newCombo]);
    setComboDialogOpen(false);
    
    // Clear the form
    if (comboFormRef.current) {
      comboFormRef.current.reset();
    }
    
    // Mobile-style notification
    toast.success('🎉 Combo Added!', {
      description: `${newCombo.name} combo has been added`,
      duration: 3000,
    });
  };

  const handleEditCombo = (combo: ComboMeal) => {
    setEditingCombo(combo);
    setComboDialogOpen(true);
  };

  const handleUpdateCombo = (formData: FormData) => {
    if (!editingCombo) return;
    
    const updatedCombos = comboMeals.map(combo =>
      combo.id === editingCombo.id
        ? {
            ...combo,
            name: formData.get('comboName') as string,
            description: formData.get('comboDescription') as string,
            originalPrice: parseFloat(formData.get('originalPrice') as string),
            discountedPrice: parseFloat(formData.get('discountedPrice') as string),
            image: formData.get('comboImage') as string || combo.image
          }
        : combo
    );
    setComboMeals(updatedCombos);
    setComboDialogOpen(false);
    setEditingCombo(null);
    
    // Mobile-style notification
    toast.success('✨ Combo Updated!', {
      description: `${formData.get('comboName')} has been updated`,
      duration: 3000,
    });
  };

  const handleToggleComboAvailability = (id: string) => {
    const combo = comboMeals.find(c => c.id === id);
    const newAvailability = !combo?.available;
    
    setComboMeals(comboMeals.map(combo =>
      combo.id === id ? { ...combo, available: !combo.available } : combo
    ));
    
    // Mobile-style notification
    if (newAvailability) {
      toast.success('✅ Combo Available', {
        description: `${combo?.name} is now available`,
        duration: 3000,
      });
    } else {
      toast.warning('⛔ Combo Unavailable', {
        description: `${combo?.name} is now unavailable`,
        duration: 3000,
      });
    }
  };

  const handleDeleteCombo = (id: string) => {
    const combo = comboMeals.find(c => c.id === id);
    setComboMeals(comboMeals.filter(combo => combo.id !== id));
    
    toast.error('🗑️ Combo Deleted', {
      description: `${combo?.name} has been removed`,
      duration: 3000,
    });
  };

  const addCustomization = () => {
    setCustomizations([
      ...customizations,
      { id: Date.now().toString(), name: '', type: 'other', options: [], selectedOptions: [] }
    ]);
  };

  const updateCustomization = (id: string, field: 'name' | 'type' | 'options', value: string | string[]) => {
    setCustomizations(customizations.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCustomization = (id: string) => {
    setCustomizations(customizations.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant menu items and combos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setCustomizations([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details of the menu item' : 'Add a new item to your menu'}
              </DialogDescription>
            </DialogHeader>
            <form ref={itemFormRef} onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              editingItem ? handleUpdateItem(formData) : handleAddItem(formData);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingItem?.name}
                      placeholder="e.g., Butter Chicken"
                      required
                      className="border-[#8B4513]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" defaultValue={editingItem?.category || 'main-course'}>
                      <SelectTrigger className="border-[#8B4513]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appetizers">Appetizers</SelectItem>
                        <SelectItem value="main-course">Main Course</SelectItem>
                        <SelectItem value="desserts">Desserts</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="specials">Specials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingItem?.price}
                      placeholder="0.00"
                      required
                      className="border-[#8B4513]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preparationTime">Prep Time (mins)</Label>
                    <Input
                      id="preparationTime"
                      name="preparationTime"
                      type="number"
                      defaultValue={editingItem?.preparationTime}
                      placeholder="15"
                      className="border-[#8B4513]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dietType">Diet Type</Label>
                    <Select name="dietType" defaultValue={editingItem?.dietType || 'veg'}>
                      <SelectTrigger className="border-[#8B4513]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingItem?.description}
                    placeholder="Brief description of the item"
                    rows={3}
                    className="border-[#8B4513]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    defaultValue={editingItem?.image}
                    placeholder="https://example.com/image.jpg"
                    className="border-[#8B4513]"
                  />
                </div>

                {/* Offer Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Offer Details (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="offerDiscount">Discount (%)</Label>
                      <Input
                        id="offerDiscount"
                        name="offerDiscount"
                        type="number"
                        defaultValue={editingItem?.offer?.discount}
                        placeholder="e.g., 10"
                        className="border-[#8B4513]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="offerLabel">Offer Label</Label>
                      <Input
                        id="offerLabel"
                        name="offerLabel"
                        defaultValue={editingItem?.offer?.label}
                        placeholder="e.g., 10% OFF"
                        className="border-[#8B4513]"
                      />
                    </div>
                  </div>
                </div>

                {/* Customizations Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Customizations</h3>
                  <div className="space-y-4">
                    {/* Spice Level Customization */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Spice Level</Label>
                        <p className="text-xs text-gray-500">Select default spice level for this item</p>
                        <RadioGroup name="spiceLevel" defaultValue={editingItem?.spiceLevel || 'medium'} className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mild" id="mild" />
                            <Label htmlFor="mild" className="cursor-pointer">Mild</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hot" id="hot" />
                            <Label htmlFor="hot" className="cursor-pointer">Hot</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="extra-hot" id="extra-hot" />
                            <Label htmlFor="extra-hot" className="cursor-pointer">Extra Hot</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </Card>

                    {/* Add-ons Customization */}
                    <Card className="p-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Add-ons (Optional)</Label>
                        <p className="text-xs text-gray-500">Select available add-ons for this item</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="addon-ketchup" />
                            <Label htmlFor="addon-ketchup" className="cursor-pointer">Ketchup</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="addon-green-chilli" />
                            <Label htmlFor="addon-green-chilli" className="cursor-pointer">Green Chilli Sauce</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="addon-cheese" />
                            <Label htmlFor="addon-cheese" className="cursor-pointer">Cheese</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="addon-pepper-dip" />
                            <Label htmlFor="addon-pepper-dip" className="cursor-pointer">Pepper Dip</Label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingItem(null);
                  setCustomizations([]);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Horizontal Category Selectors */}
            <div className="w-full overflow-x-auto pb-2">
              <nav className="flex gap-3 min-w-max p-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[180px]',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:bg-muted shadow-sm'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive ? '' : 'text-muted-foreground')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', isActive ? '' : '')}>
                          {category.name}
                        </p>
                        <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                          {category.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Filter by Offers Button */}
              <Button
                variant={showOffersOnly ? 'default' : 'outline'}
                onClick={() => setShowOffersOnly(!showOffersOnly)}
                className="whitespace-nowrap rounded-lg"
              >
                <Tag className="h-4 w-4 mr-2" />
                {showOffersOnly ? 'Showing Offers' : 'Filter by Offers'}
              </Button>
            </div>

            {/* Diet Filter (Only for Main Course) */}
            {activeCategory === 'main-course' && (
              <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium mr-2 flex items-center">Diet Type:</span>
                <Button
                  variant={dietFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDietFilter('all')}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  All
                </Button>
                <Button
                  variant={dietFilter === 'veg' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDietFilter('veg')}
                >
                  <Leaf className="h-3 w-3 mr-1" />
                  Vegetarian
                </Button>
                <Button
                  variant={dietFilter === 'non-veg' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDietFilter('non-veg')}
                >
                  <Drumstick className="h-3 w-3 mr-1" />
                  Non-Vegetarian
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation for Items and Combos */}
      <div className="w-full overflow-x-auto pb-4">
        <nav className="flex gap-3 min-w-max p-1">
          {[
            { id: 'items', label: 'Menu Items', icon: LayoutGrid, description: `Manage individual dishes (${filteredItems.length})` },
            { id: 'combos', label: 'Combo Meals', icon: Package, description: `Manage bundled deals (${comboMeals.length})` },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[240px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-muted shadow-sm'
                )}
              >
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive ? '' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', isActive ? '' : '')}>
                    {item.label}
                  </p>
                  <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* TabsList removed and replaced by horizontal nav above */}

        <TabsContent value="items" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 flex-wrap justify-end">
                    {item.dietType && (
                      <Badge variant="secondary" className="bg-white/90">
                        {item.dietType === 'veg' ? (
                          <><Leaf className="h-3 w-3 mr-1 text-green-600" /> Veg</>
                        ) : (
                          <><Drumstick className="h-3 w-3 mr-1 text-red-600" /> Non-Veg</>
                        )}
                      </Badge>
                    )}
                    {item.spiceLevel && (
                      <Badge variant="secondary" className="bg-white/90">
                        <Flame className="h-3 w-3 mr-1" />
                        {item.spiceLevel}
                      </Badge>
                    )}
                    {item.offer && (
                      <Badge className="bg-red-500 text-white">
                        {item.offer.label}
                      </Badge>
                    )}
                    <Badge className={item.available ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'}>
                      {item.available ? '✓ Available' : '✗ Unavailable'}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-lg font-bold">
                      <IndianRupee className="h-4 w-4" />
                      {item.price}
                    </div>
                    {item.preparationTime && (
                      <Badge variant="outline" className="text-xs">
                        {item.preparationTime} mins
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Available:</span>
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailability(item.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {item.customizations.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-600 mb-1">Customizations:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.customizations.map(custom => (
                          <Badge key={custom.id} variant="secondary" className="text-xs">
                            {custom.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="combos" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Dialog open={comboDialogOpen} onOpenChange={(open) => {
              setComboDialogOpen(open);
              if (!open) {
                setEditingCombo(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Combo Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCombo ? 'Edit Combo Meal' : 'Add New Combo Meal'}</DialogTitle>
                  <DialogDescription>
                    {editingCombo ? 'Update the combo meal details' : 'Create a combo meal with special pricing'}
                  </DialogDescription>
                </DialogHeader>
                <form ref={comboFormRef} onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  editingCombo ? handleUpdateCombo(formData) : handleAddCombo(formData);
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="comboName">Combo Name *</Label>
                      <Input
                        id="comboName"
                        name="comboName"
                        defaultValue={editingCombo?.name}
                        placeholder="e.g., Family Feast Combo"
                        required
                        className="border-[#8B4513]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="comboDescription">Description *</Label>
                      <Textarea
                        id="comboDescription"
                        name="comboDescription"
                        defaultValue={editingCombo?.description}
                        placeholder="Describe what's included in the combo"
                        rows={3}
                        required
                        className="border-[#8B4513]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingCombo?.originalPrice}
                          placeholder="0.00"
                          required
                          className="border-[#8B4513]"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="discountedPrice">Combo Price (₹) *</Label>
                        <Input
                          id="discountedPrice"
                          name="discountedPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingCombo?.discountedPrice}
                          placeholder="0.00"
                          required
                          className="border-[#8B4513]"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="comboImage">Image URL</Label>
                      <Input
                        id="comboImage"
                        name="comboImage"
                        type="url"
                        defaultValue={editingCombo?.image}
                        placeholder="https://example.com/image.jpg"
                        className="border-[#8B4513]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setComboDialogOpen(false);
                      setEditingCombo(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCombo ? 'Update Combo' : 'Add Combo'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comboMeals.map(combo => (
              <Card key={combo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={combo.available ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'}>
                      {combo.available ? '✓ Available' : '✗ Unavailable'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-green-600 text-white">
                      Save ₹{combo.originalPrice - combo.discountedPrice}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{combo.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {combo.description}
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center text-lg font-bold text-green-600">
                      <IndianRupee className="h-4 w-4" />
                      {combo.discountedPrice}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 line-through">
                      <IndianRupee className="h-3 w-3" />
                      {combo.originalPrice}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Available:</span>
                      <Switch
                        checked={combo.available}
                        onCheckedChange={() => handleToggleComboAvailability(combo.id)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCombo(combo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCombo(combo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
