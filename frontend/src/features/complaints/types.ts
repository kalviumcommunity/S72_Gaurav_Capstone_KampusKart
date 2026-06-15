export interface Complaint {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  title: string;
  description: string;
  category: 'Academic' | 'Administrative' | 'Facilities' | 'IT' | 'Security' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  department: 'Academic Affairs' | 'Administration' | 'Facilities Management' | 'IT Services' | 'Security' | 'Student Services';
  assignedTo?: {
    _id: string;
    name: string;
  };
  estimatedResolutionTime?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  statusHistory: Array<{
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    comment?: string;
    updatedBy: {
      _id: string;
      name?: string;
    } | string;
    timestamp: string;
  }>;
  createdAt: string;
  lastUpdated: string;
  stayAnonymous?: boolean;
  images?: { url: string; public_id?: string }[];
}

export interface ComplaintFilters {
  status: 'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: 'all' | 'Academic' | 'Administrative' | 'Facilities' | 'IT' | 'Security' | 'Other';
  search: string;
  page: number;
}
