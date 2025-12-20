
export enum PackageTier {
  SPARK = 'Spark',
  RADIANCE = 'Radiance',
  LUMINARY = 'Luminary'
}

export interface ServicePackage {
  id: string;
  name: string;
  price?: number; 
  features: string[];
  recommended?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

export interface GraphicItem {
  id: string;
  title: string;
  description: string;
  category: 'stationery' | 'packaging';
  image?: string;
}

export interface EcomPlatform {
  id: string;
  name: string;
  type: 'marketplace' | 'food';
  logo?: string;
  domain?: string;
  description?: string;
  availableInIndia?: boolean;
}

export interface Invoice {
  id: string | number;
  invoice_id?: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'paid' | 'pending' | 'cancelled';
  service: string;
  pdfUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

export interface UserSubscription {
  id: string;
  packageName: string;
  startDate: string;
  renewalDate: string;
  status: 'Active' | 'Cancelled' | 'Expired';
}

export type PipelineStatus = 
  | 'backlog' 
  | 'writing' 
  | 'design' 
  | 'review' 
  | 'approval' 
  | 'scheduled' 
  | 'posted';

export interface Comment {
  id: string;
  author: string;
  role: 'client' | 'agency';
  text: string;
  date: string;
}

export interface PipelinePost {
  id: string | number;
  title: string; // Used as Item Title (e.g. poster-08) or descriptive title
  platform: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'all' | string; 
  status: PipelineStatus;
  dueDate: string;
  thumbnail?: string;
  caption?: string;
  description?: string; 
  comments?: Comment[];
  hashtags?: string[];
  assignees?: string[]; // Array of employee IDs or Names
}

export interface BusinessDetails {
  name: string;
  address: string;
  gstin: string;
  hsn: string;
  email: string;
  phone: string;
  whatsappConsent: boolean;
}

export interface ContactPersonDetails {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappConsent: boolean;
}

export interface UserProfile {
  id?: number; 
  business: BusinessDetails;
  contactPerson: ContactPersonDetails;
}

export interface AdminServiceItem {
  code: string;
  name: string;
  description: string;
  price: number;
  category: string;
  hsn?: string; // Added HSN
}

export interface BankDetails {
  accountName: string;
  ifsc: string;
  bankName: string;
  accountNumber: string;
}

export interface AdminCompanyDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  secondaryEmail?: string;
  gstin?: string;
  bankDetails: BankDetails;
  paymentModes: string[];
  paymentTerms: string[];
}

// --- NEW ADMIN TYPES ---

export interface AdminEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'manager' | 'content_writer' | 'designer' | 'viewer'; // Updated roles
}

export interface AdminInvoiceItem {
  serviceId: string;
  name: string;
  description: string;
  hsn: string;
  quantity: number;
  price: number;
  taxRate: number; // Percentage
  total: number;
}

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientGstin?: string;
  items: AdminInvoiceItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  authorizedBy: string;
  paymentMode?: string;
  paymentTerms?: string;
}

export interface AdminClient {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  isActive: boolean;
  pendingPayment: number;
  // Details for drill-down
  businessDetails?: BusinessDetails;
  contactDetails?: ContactPersonDetails;
  subscriptions?: UserSubscription[];
  invoices?: AdminInvoice[]; // Or simpler Invoice type
}

export interface MetaToken {
  id: number;
  account_label: string;
  user_name: string;
  profile_picture: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface MetaPage {
  account_label: string;
  token_id: number;
  fb_page_id: string;
  fb_page_name: string;
  fb_page_picture: string;
  ig_account_id: string;
}

// --- API TYPES ---

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PipelineConfigItem {
  prefix: string;
  count: number;
}

export interface BackendService {
  id: number;
  service_id: string;
  name: string;
  description?: string;
  hsn?: string;
  category: BackendCategory;
  price: string | number;
  is_active: boolean;
  is_pipeline?: boolean;
  pipeline_config?: PipelineConfigItem[];
}
