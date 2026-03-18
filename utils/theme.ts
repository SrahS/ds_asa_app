import { Platform } from 'react-native';

const theme = {
    colors: {
        primary: '#0061FF', // Azul Primary 600 (Cor do Logo DSA)
        secondary: '#FF9318',
        error: '#EF4444', // Error 500
        success: '#22C55E', // Success 500
        warning: '#F59E0B', // Warning 500

        primaryText: '#181718', // Typography 900
        secondaryText: '#737373', // Typography 500

        background: '#FFFFFF', // Background 0
        foreground: '#FBFBFB', // Background Light
        formsBackground: '#F5F5F5', // Background Muted
        border: '#E5E5E5', // Outline 200

        toast: {
            danger: '#EF4444',
            success: '#22C55E',
            warning: '#F59E0B',
        },
    },
    fonts: {
        light: {
            fontLight: Platform.OS === 'ios' ? 'Inter-Light' : 'inter',
        },
        medium: {
            fontMedium: Platform.OS === 'ios' ? 'Inter-Medium' : 'inter',
        },
        bold: {
            fontBold: Platform.OS === 'ios' ? 'Inter-Bold' : 'inter',
        },
        black: {
            fontBlack: Platform.OS === 'ios' ? 'Inter-Black' : 'inter',
        },
    },
    shadows: {
        soft: '0px 0px 10px rgba(38, 38, 38, 0.1)',
        hard: '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
    }
};

export default theme;