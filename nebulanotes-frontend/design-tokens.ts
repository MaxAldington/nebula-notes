import crypto from 'crypto';

// 计算确定性 seed
const projectName = "NebulaNotes";
const network = "localhost";
const yearMonth = "202410";
const contractName = "NebulaNotes.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');
const seedNum = parseInt(seed.substring(0, 8), 16);

// 根据 seed 选择设计维度
const designSystemIndex = seedNum % 5; // 0-4
const colorSchemeIndex = seedNum % 8; // 0-7
const typographyIndex = seedNum % 3; // 0-2
const layoutIndex = seedNum % 5; // 0-4

const designSystems = ['Material', 'Fluent', 'Neumorphism', 'Glassmorphism', 'Minimal'];
const colorSchemes = [
  { primary: '#4F46E5', secondary: '#9333EA', accent: '#EC4899', name: 'Indigo/Purple/Pink' }, // A
  { primary: '#3B82F6', secondary: '#06B6D4', accent: '#14B8A6', name: 'Blue/Cyan/Teal' },     // B
  { primary: '#10B981', secondary: '#84CC16', accent: '#EAB308', name: 'Green/Lime/Yellow' }, // C
  { primary: '#F97316', secondary: '#F59E0B', accent: '#EF4444', name: 'Orange/Amber/Red' },  // D
  { primary: '#A855F7', secondary: '#7C3AED', accent: '#6366F1', name: 'Purple/Deep Purple/Indigo' }, // E
  { primary: '#14B8A6', secondary: '#10B981', accent: '#06B6D4', name: 'Teal/Green/Cyan' },   // F
  { primary: '#EF4444', secondary: '#EC4899', accent: '#F97316', name: 'Red/Pink/Orange' },  // G
  { primary: '#06B6D4', secondary: '#3B82F6', accent: '#0EA5E9', name: 'Cyan/Blue/Light Blue' } // H
];
const typographySystems = ['Serif', 'Sans-Serif', 'Monospace'];
const layouts = ['Sidebar', 'Masonry', 'Tabs', 'Grid', 'Wizard'];

export const designTokens = {
  system: designSystems[designSystemIndex],
  seed: seed,
  seedNum: seedNum,

  colors: {
    light: {
      primary: colorSchemes[colorSchemeIndex].primary,
      secondary: colorSchemes[colorSchemeIndex].secondary,
      accent: colorSchemes[colorSchemeIndex].accent,
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      textSecondary: '#64748B',
      border: '#E2E8F0',
    },
    dark: {
      primary: colorSchemes[colorSchemeIndex].primary,
      secondary: colorSchemes[colorSchemeIndex].secondary,
      accent: colorSchemes[colorSchemeIndex].accent,
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
    },
  },

  typography: {
    system: typographySystems[typographyIndex],
    fontFamily: {
      sans: typographyIndex === 0 ? ['Georgia', 'serif'] :
            typographyIndex === 1 ? ['Inter', 'system-ui', 'sans-serif'] :
            ['JetBrains Mono', 'monospace'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    scale: typographyIndex === 0 ? 1.2 :
           typographyIndex === 1 ? 1.25 :
           1.15,
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.563rem',
      '2xl': '1.953rem',
      '3xl': '2.441rem',
    },
  },

  spacing: {
    unit: 8,
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
  },

  transitions: {
    duration: designSystemIndex === 1 ? 100 :
              designSystemIndex === 3 ? 300 :
              200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: layouts[layoutIndex],

  density: {
    compact: {
      padding: { sm: '4px 8px', md: '8px 16px', lg: '12px 24px' },
      gap: '8px',
    },
    comfortable: {
      padding: { sm: '8px 16px', md: '16px 24px', lg: '20px 32px' },
      gap: '16px',
    },
  },

  componentStyles: {
    borderRadius: designSystemIndex === 2 ? '12px' : '8px', // Neumorphism gets larger radius
    shadow: designSystemIndex === 2 ? '0 8px 32px rgba(0,0,0,0.12)' : '0 4px 6px rgba(0,0,0,0.1)',
    borderWidth: designSystemIndex === 4 ? '0.5px' : '1px', // Minimal gets thinner borders
  },
};

