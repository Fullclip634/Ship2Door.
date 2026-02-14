export const colors = {
    orange: {
        50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
        400: '#FB923C', 500: '#F5941E', 600: '#EA7C0B', 700: '#C2630A',
    },
    navy: {
        50: '#EEF2F7', 100: '#D5DEEB', 200: '#ADBDD7', 300: '#7E97BE',
        500: '#3D5A87', 600: '#2D4568', 700: '#1B2B4D', 800: '#14213A', 900: '#0E1729',
    },
    gray: {
        25: '#FCFCFD', 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
        400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827',
    },
    success: { 50: '#F0FDF4', 500: '#22C55E', 700: '#15803D' },
    warning: { 50: '#FFFBEB', 500: '#EAB308', 700: '#A16207' },
    danger: { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' },
    info: { 50: '#EFF6FF', 500: '#3B82F6', 700: '#1D4ED8' },
    white: '#FFFFFF',
    black: '#000000',
};

export const statusColors = {
    scheduled: { bg: colors.info[50], text: colors.info[700] },
    picking_up: { bg: colors.warning[50], text: colors.warning[700] },
    pending_pickup: { bg: colors.warning[50], text: colors.warning[700] },
    departed: { bg: colors.navy[50], text: colors.navy[600] },
    picked_up: { bg: colors.navy[50], text: colors.navy[600] },
    in_transit: { bg: colors.orange[50], text: colors.orange[700] },
    delayed: { bg: colors.danger[50], text: colors.danger[700] },
    arrived: { bg: '#F0FDF4', text: '#166534' },
    out_for_delivery: { bg: '#ECFDF5', text: '#065F46' },
    delivering: { bg: '#ECFDF5', text: '#065F46' },
    completed: { bg: colors.success[50], text: colors.success[700] },
    delivered: { bg: colors.success[50], text: colors.success[700] },
    cancelled: { bg: colors.gray[100], text: colors.gray[600] },
};

export const fonts = {
    light: { fontWeight: '300' },
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
    extrabold: { fontWeight: '800' },
};

export const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const directionLabel = (d) => d === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';
