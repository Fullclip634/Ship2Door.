import { Platform } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────────
export const colors = {
  orange: {
    50: '#FFF8F0',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F5941E',
    600: '#EA7C0C',
    700: '#C2630A',
    800: '#9A3412',
  },
  navy: {
    50: '#EEF2F7',
    100: '#D5DEEB',
    200: '#A8B8D0',
    400: '#5C7BA3',
    500: '#3D5A87',
    600: '#2E4A73',
    700: '#1B2B4D',
    800: '#141F38',
    900: '#0D1526',
  },
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  white: '#FFFFFF',
  success: { 50: '#F0FDF4', 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
  warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706' },
  danger: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
  info: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB' },
};

// ─── Spacing Scale ──────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ─── Border Radius ──────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
};

// ─── Shadows ────────────────────────────────────────────────────
export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    android: { elevation: 3 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    android: { elevation: 6 },
  }),
  xl: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24 },
    android: { elevation: 10 },
  }),
  card: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12 },
    android: { elevation: 2 },
  }),
  button: Platform.select({
    ios: { shadowColor: '#F5941E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    android: { elevation: 4 },
  }),
  tabBar: Platform.select({
    ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12 },
    android: { elevation: 8 },
  }),
};

// ─── Typography ─────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6, fontFamily: 'Inter_700Bold' },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, fontFamily: 'Inter_700Bold' },
  h3: { fontSize: 18, fontWeight: '600', letterSpacing: -0.3, fontFamily: 'Inter_600SemiBold' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22, fontFamily: 'Inter_400Regular' },
  bodyMedium: { fontSize: 15, fontWeight: '500', lineHeight: 22, fontFamily: 'Inter_500Medium' },
  bodySemiBold: { fontSize: 14, fontWeight: '600', lineHeight: 20, fontFamily: 'Inter_600SemiBold' },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18, fontFamily: 'Inter_500Medium' },
  small: { fontSize: 12, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  overline: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' },
  label: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  button: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  buttonSm: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  mono: { fontSize: 14, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
};

// ─── Reusable Style Fragments ──────────────────────────────────
export const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: radius.lg,
  padding: spacing.base,
  ...shadows.card,
};

export const inputStyle = {
  backgroundColor: colors.gray[50],
  borderWidth: 1,
  borderColor: colors.gray[200],
  borderRadius: radius.md,
  paddingHorizontal: 16,
  height: 52,
  fontSize: 15,
  color: colors.gray[900],
  fontFamily: 'Inter_400Regular',
};

// ─── Status Color Map ──────────────────────────────────────────
export const statusColors = {
  scheduled: { bg: colors.info[50], text: colors.info[600], dot: colors.info[500] },
  picking_up: { bg: colors.warning[50], text: colors.warning[600], dot: colors.warning[500] },
  picked_up: { bg: colors.warning[50], text: colors.warning[600], dot: colors.warning[500] },
  pending_pickup: { bg: colors.warning[50], text: colors.warning[600], dot: colors.warning[500] },
  departed: { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' },
  in_transit: { bg: '#F0F9FF', text: '#0369A1', dot: '#0EA5E9' },
  delayed: { bg: colors.danger[50], text: colors.danger[600], dot: colors.danger[500] },
  arrived: { bg: colors.success[50], text: colors.success[600], dot: colors.success[500] },
  delivering: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  out_for_delivery: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  delivered: { bg: colors.success[50], text: colors.success[700], dot: colors.success[600] },
  completed: { bg: colors.success[50], text: colors.success[700], dot: colors.success[600] },
  cancelled: { bg: colors.gray[100], text: colors.gray[500], dot: colors.gray[400] },
};

// ─── Utility Functions ─────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const directionLabel = (direction) =>
  direction === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila';
