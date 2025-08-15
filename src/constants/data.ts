import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Arc',
    url: '/dashboard/arc',
    icon: 'dashboard', // Replace with 'map' if you add a map icon to Icons
    shortcut: ['t', 't'],
    isActive: true, // Make Traffic the active/default route
    items: [
      {
        title: 'Arc GIS Map',
        url: '/dashboard/arc/map',
        shortcut: ['t', 'm']
      }
    ]
  }
];

