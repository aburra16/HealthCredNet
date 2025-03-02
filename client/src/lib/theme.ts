import { createTheme, MantineColorsTuple } from '@mantine/core';

// Modern healthcare color palette
// Primary color: Medical Blue - trustworthy, professional, clean
const medicalBlue: MantineColorsTuple = [
  '#E6F3FF', // 0: Lightest shade
  '#CCE7FF', // 1
  '#99C9F5', // 2
  '#66ABE8', // 3
  '#3D91DC', // 4
  '#1A7AD1', // 5: Primary shade
  '#1567B3', // 6
  '#105396', // 7
  '#0A3F78', // 8
  '#052A5A'  // 9: Darkest shade
];

// Secondary color: Healing Teal - calming, healing, technical
const healingTeal: MantineColorsTuple = [
  '#E6F9F7', // 0: Lightest shade
  '#CCF3EF', // 1
  '#99E4DC', // 2
  '#66D4C9', // 3
  '#3DC6B8', // 4
  '#1AB9A9', // 5: Primary shade
  '#179C8F', // 6
  '#138074', // 7
  '#0E6359', // 8
  '#09453F'  // 9: Darkest shade
];

// Accent color: Trust Purple - verification, credentials, authority
const trustPurple: MantineColorsTuple = [
  '#F0E6FF', // 0: Lightest shade
  '#E0CCF9', // 1
  '#C299F0', // 2
  '#A466E6', // 3
  '#8A3DDC', // 4
  '#731AD2', // 5: Primary shade
  '#6217B3', // 6
  '#521196', // 7
  '#410B78', // 8
  '#29055A'  // 9: Darkest shade
];

// Status colors
const success: MantineColorsTuple = [
  '#E7F9ED', // 0: Lightest shade
  '#D0F4DB', // 1
  '#A1E9B7', // 2
  '#71DE93', // 3
  '#42D26F', // 4
  '#22C555', // 5: Primary shade
  '#1CA649', // 6
  '#17873C', // 7
  '#12682F', // 8
  '#0C4921'  // 9: Darkest shade
];

const warning: MantineColorsTuple = [
  '#FEF5E7', // 0: Lightest shade
  '#FDEAD0', // 1
  '#FBD5A1', // 2
  '#F9C073', // 3
  '#F7AA44', // 4
  '#F59F22', // 5: Primary shade
  '#D1871D', // 6
  '#AD6F18', // 7
  '#895713', // 8
  '#653E0E'  // 9: Darkest shade
];

const error: MantineColorsTuple = [
  '#FDEDED', // 0: Lightest shade
  '#FBDBDB', // 1
  '#F7B7B7', // 2
  '#F39393', // 3
  '#EF6F6F', // 4
  '#EB5757', // 5: Primary shade
  '#C94A4A', // 6
  '#A73D3D', // 7
  '#852F2F', // 8
  '#612222'  // 9: Darkest shade
];

// Modern healthcare theme for MedCred
export const medCredTheme = createTheme({
  // Modern color scheme
  colors: {
    'medical-blue': medicalBlue,
    'healing-teal': healingTeal,
    'trust-purple': trustPurple,
    'success': success,
    'warning': warning,
    'error': error,
  },
  
  // Set primary color for global use in components
  primaryColor: 'medical-blue',
  
  // Modern, clean UI
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  // Modern shadow for depth
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.03)',
  },
  
  // Modern typography settings
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: "'Roboto Mono', monospace",
  
  // Default heading styles
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: '2.25rem', lineHeight: '2.75rem', fontWeight: '700' },
      h2: { fontSize: '1.75rem', lineHeight: '2.25rem', fontWeight: '700' },
      h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
      h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },
      h5: { fontSize: '1.125rem', lineHeight: '1.5rem', fontWeight: '600' },
      h6: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '600' },
    },
  },
  
  // Component specific overrides for a modern healthcare look
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        p: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
  
  // Other theme settings
  other: {
    // Custom values that can be accessed in components
    credentialColors: {
      verified: '#22C555',
      pending: '#F59F22',
      rejected: '#EB5757',
    },
    specialtyColors: {
      'Cardiology': '#E91E63',
      'Dermatology': '#9C27B0',
      'Family Medicine': '#3F51B5',
      'Neurology': '#2196F3',
      'Pediatrics': '#00BCD4',
      'Psychiatry': '#673AB7',
      'Orthopedics': '#FF5722',
      'Oncology': '#795548',
      'Ophthalmology': '#607D8B',
      'Gastroenterology': '#FF9800',
    },
  },
});

// Helper function to get specialty color
export function getSpecialtyColor(specialty: string | undefined, defaultColor = '#1A7AD1'): string {
  if (!specialty) return defaultColor;
  
  const specialtyColors: Record<string, string> = {
    'Cardiology': '#E91E63',
    'Dermatology': '#9C27B0',
    'Family Medicine': '#3F51B5',
    'Neurology': '#2196F3',
    'Pediatrics': '#00BCD4',
    'Psychiatry': '#673AB7',
    'Orthopedics': '#FF5722',
    'Oncology': '#795548',
    'Ophthalmology': '#607D8B',
    'Gastroenterology': '#FF9800',
  };
  
  return specialtyColors[specialty] || defaultColor;
}

// Helper function to get credential status color
export function getCredentialStatusColor(status: string | undefined, defaultColor = '#1A7AD1'): string {
  if (!status) return defaultColor;
  
  const statusColors: Record<string, string> = {
    'verified': '#22C555',
    'approved': '#22C555',
    'pending': '#F59F22',
    'rejected': '#EB5757',
  };
  
  const normalizedStatus = status.toLowerCase();
  return statusColors[normalizedStatus] || defaultColor;
}