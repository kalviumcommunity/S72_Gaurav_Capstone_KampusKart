// KampusKart Theme Configuration
export const themeConfig = {
  // Primary Colors
  colors: {
    primary: '#00C6A7',      // Main brand color (teal)
    secondary: '#FFD166',     // Secondary brand color (yellow)
    accent: '#F05A25',        // Accent color (orange)
    success: '#10B981',       // Success green
    warning: '#F59E0B',       // Warning orange
    error: '#EF4444',         // Error red
    info: '#3B82F6',          // Info blue
    
    // Neutral Colors
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F7F7FA',
      dark: '#1F2937',
    },
    
    // Text Colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      light: '#9CA3AF',
      white: '#FFFFFF',
    }
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "'Work Sans', ui-sans-serif, system-ui, sans-serif",
      secondary: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Animations
  animations: {
    pulse: 'pulse 2s infinite',
    spin: 'spin 1s linear infinite',
    bounce: 'bounce 1s infinite',
    fadeIn: 'fadeIn 0.5s ease-in',
    slideIn: 'slideIn 0.3s ease-out',
  },

  // Loading Specific Theme
  loading: {
    // Logo Animation
    logo: {
      pulse: {
        '0%': { transform: 'scale(1)', opacity: 1 },
        '50%': { transform: 'scale(1.1)', opacity: 0.7 },
        '100%': { transform: 'scale(1)', opacity: 1 },
      }
    },
    
    // Progress Colors
    progress: {
      primary: '#00C6A7',
      secondary: '#FFD166',
      success: '#10B981',
      error: '#EF4444',
    },
    
    // Step Colors
    steps: {
      pending: '#6B7280',
      active: '#00C6A7',
      completed: '#10B981',
      error: '#EF4444',
    }
  },

  // Component Specific Themes
  components: {
    button: {
      primary: {
        background: '#00C6A7',
        hover: '#009e87',
        text: '#FFFFFF',
      },
      secondary: {
        background: '#FFD166',
        hover: '#F59E0B',
        text: '#000000',
      },
      outline: {
        background: 'transparent',
        border: '#00C6A7',
        text: '#00C6A7',
        hover: '#00C6A7',
        hoverText: '#FFFFFF',
      }
    },
    
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      hoverShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    
    input: {
      background: '#FFFFFF',
      border: '#D1D5DB',
      focusBorder: '#00C6A7',
      placeholder: '#9CA3AF',
    }
  }
};

// Utility functions for theme usage
export const getThemeColor = (colorKey: string) => {
  const keys = colorKey.split('.');
  let value: any = themeConfig.colors;
  
  for (const key of keys) {
    value = value[key];
  }
  
  return value;
};

export const getComponentTheme = (component: string, variant: string) => {
  return themeConfig.components[component]?.[variant] || {};
};

// CSS Variables for easy usage
export const cssVariables = {
  '--color-primary': themeConfig.colors.primary,
  '--color-secondary': themeConfig.colors.secondary,
  '--color-accent': themeConfig.colors.accent,
  '--color-success': themeConfig.colors.success,
  '--color-warning': themeConfig.colors.warning,
  '--color-error': themeConfig.colors.error,
  '--color-info': themeConfig.colors.info,
  '--color-background': themeConfig.colors.background.primary,
  '--color-background-secondary': themeConfig.colors.background.secondary,
  '--color-text-primary': themeConfig.colors.text.primary,
  '--color-text-secondary': themeConfig.colors.text.secondary,
  '--font-family-primary': themeConfig.typography.fontFamily.primary,
  '--border-radius-base': themeConfig.borderRadius.base,
  '--shadow-base': themeConfig.shadows.base,
  '--shadow-lg': themeConfig.shadows.lg,
};

export default themeConfig; 