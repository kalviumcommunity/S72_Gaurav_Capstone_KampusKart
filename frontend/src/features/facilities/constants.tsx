import { MdSchool, MdRestaurant, MdLocalLaundryService, MdHotel, MdLibraryBooks, MdFastfood, MdLocalCafe, MdRoomService, MdBed, MdApartment } from 'react-icons/md';

export const ICON_OPTIONS = [
  { 
    value: 'MdSchool', 
    label: 'Academic - School', 
    icon: <MdSchool className="w-10 h-10" />,
    gradient: 'from-blue-500 to-indigo-600',
    color: 'text-blue-600'
  },
  { 
    value: 'MdLibraryBooks', 
    label: 'Academic - Library', 
    icon: <MdLibraryBooks className="w-10 h-10" />,
    gradient: 'from-purple-500 to-pink-600',
    color: 'text-purple-600'
  },
  { 
    value: 'MdRestaurant', 
    label: 'Food - Restaurant', 
    icon: <MdRestaurant className="w-10 h-10" />,
    gradient: 'from-orange-500 to-red-600',
    color: 'text-orange-600'
  },
  { 
    value: 'MdFastfood', 
    label: 'Food - Fast Food', 
    icon: <MdFastfood className="w-10 h-10" />,
    gradient: 'from-yellow-500 to-orange-600',
    color: 'text-yellow-600'
  },
  { 
    value: 'MdLocalCafe', 
    label: 'Food - Cafe', 
    icon: <MdLocalCafe className="w-10 h-10" />,
    gradient: 'from-amber-500 to-orange-600',
    color: 'text-amber-600'
  },
  { 
    value: 'MdLocalLaundryService', 
    label: 'Service - Laundry', 
    icon: <MdLocalLaundryService className="w-10 h-10" />,
    gradient: 'from-cyan-500 to-blue-600',
    color: 'text-cyan-600'
  },
  { 
    value: 'MdRoomService', 
    label: 'Service - Room Service', 
    icon: <MdRoomService className="w-10 h-10" />,
    gradient: 'from-teal-500 to-green-600',
    color: 'text-teal-600'
  },
  { 
    value: 'MdHotel', 
    label: 'Accommodation - Hotel', 
    icon: <MdHotel className="w-10 h-10" />,
    gradient: 'from-emerald-500 to-teal-600',
    color: 'text-emerald-600'
  },
  { 
    value: 'MdBed', 
    label: 'Accommodation - Hostel', 
    icon: <MdBed className="w-10 h-10" />,
    gradient: 'from-green-500 to-emerald-600',
    color: 'text-green-600'
  },
  { 
    value: 'MdApartment', 
    label: 'Accommodation - Apartment', 
    icon: <MdApartment className="w-10 h-10" />,
    gradient: 'from-lime-500 to-green-600',
    color: 'text-lime-600'
  },
];

export const getIconByValue = (value: string) => {
  return ICON_OPTIONS.find(opt => opt.value === value);
};
