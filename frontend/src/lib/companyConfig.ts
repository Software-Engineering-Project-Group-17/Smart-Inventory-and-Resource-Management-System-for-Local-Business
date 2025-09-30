// Company configuration for invoice generation
// Update these values to match your business information

import { branchAPI, BranchResponse } from './api/branchAPI';

export interface CompanyConfig {
  name: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  businessNumber?: string;
  logo?: {
    url?: string;
    width?: number;
    height?: number;
  };
}

export interface BranchInfo {
  id: number;
  name: string;
  location: string;
  contactNumber: string;
  email: string;
  description?: string;
}

export const COMPANY_CONFIG: CompanyConfig = {
  name: "BUILDMATE",
  branch: "Main Branch", // Default fallback
  address: "123 Construction Avenue, Builder City, BC 12345", // Default fallback
  phone: "+1 (555) BUILD-IT", // Default fallback
  email: "info@buildmate.com",
  website: "www.buildmate.com",
  taxId: "TAX-123456789",
  businessNumber: "BN-987654321",
  logo: {
    // Add your logo URL here when available
    // url: "/logo.png",
    width: 100,
    height: 40
  }
};

// Branch-specific configurations
// Add more branches as needed
export const BRANCH_CONFIGS: { [key: string]: Partial<CompanyConfig> } = {
  "main": {
    branch: "Main Branch",
    address: "123 Construction Avenue, Builder City, BC 12345",
    phone: "+1 (555) BUILD-IT"
  },
  "downtown": {
    branch: "Downtown Branch",
    address: "456 Commerce Street, Builder City, BC 54321",
    phone: "+1 (555) BUILD-DT"
  },
  "north": {
    branch: "North Branch", 
    address: "789 Industrial Road, Builder City, BC 67890",
    phone: "+1 (555) BUILD-N"
  }
};

// PDF styling configuration
export const PDF_CONFIG = {
  colors: {
    primary: [54, 116, 181], // #3674B5 - BUILDMATE blue
    secondary: [250, 218, 122], // #FADA7A - BUILDMATE yellow
    success: [16, 185, 129], // Green
    error: [239, 68, 68], // Red
    darkGray: [64, 64, 64],
    lightGray: [128, 128, 128],
    white: [255, 255, 255]
  },
  fonts: {
    title: { size: 24, style: 'bold' as const },
    heading: { size: 14, style: 'bold' as const },
    subheading: { size: 12, style: 'normal' as const },
    body: { size: 10, style: 'normal' as const },
    small: { size: 8, style: 'normal' as const }
  },
  spacing: {
    headerHeight: 40,
    sectionMargin: 15,
    lineSpacing: 6,
    tableMargin: 20
  }
};

// Function to get company configuration with dynamic branch data
export async function getCompanyConfig(userEmail?: string): Promise<CompanyConfig> {
  let config = { ...COMPANY_CONFIG };
  
  if (userEmail) {
    try {
      console.log('Fetching branch data for user:', userEmail);
      
      // Try to get authenticated user's specific branch first
      try {
        console.log('Trying authenticated user branch endpoint...');
        const branch = await branchAPI.getMyBranch(userEmail);
        
        console.log('Got authenticated user branch:', branch);
        config = {
          ...config,
          branch: branch.name,
          address: branch.location,
          phone: branch.contactNumber,
          email: userEmail,
        };
        
        console.log('Updated company config with user branch data');
        return config;
      } catch (authBranchError) {
        console.log('Auth branch endpoint failed, trying branches list:', authBranchError);
      }

      // Fallback: Use external branchAPI
      console.log('Using external branchAPI...');
      const branches = await branchAPI.getBranchesByOwner(userEmail);
      
      if (branches && branches.length > 0) {
        // Use the first branch for the user
        const branch = branches[0];
        console.log('Using external branch API data:', branch);
        
        config = {
          ...config,
          branch: branch.name,
          address: branch.location,
          phone: branch.contactNumber,
          email: userEmail, // Use user email as branch email
        };
        
        console.log('Updated company config with external branch data');
      } else {
        console.warn('No branches found for user, using default configuration');
      }
      
    } catch (error) {
      console.error('Error fetching branch configuration:', error);
      console.warn('Using default configuration due to error');
      // Fallback to default configuration
    }
  } else {
    console.log('No user email provided, using default configuration');
  }
  
  return config;
}

// Legacy function for backward compatibility with static branch selection
export const getStaticCompanyConfig = (branchId?: string): CompanyConfig => {
  const baseConfig = { ...COMPANY_CONFIG };
  
  if (branchId && BRANCH_CONFIGS[branchId]) {
    return { ...baseConfig, ...BRANCH_CONFIGS[branchId] };
  }
  
  return baseConfig;
};