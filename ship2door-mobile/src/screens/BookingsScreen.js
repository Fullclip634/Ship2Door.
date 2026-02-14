import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bookingAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate, statusColors } from '../theme';
import { Package } from 'lucide-react-native';

export default function BookingsScreen({ navigation }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('');

    const filters = ['', 'pending_pickup', 'picked_up', 'in_transit', 'delivered'];

    const loadBookings = async () => {
        try {
            const params = {};
            if (filter) params.status = filter;
            const res = await bookingAPI.getMy(params);
            setBookings(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { loadBookings(); }, [filter]));

    const renderBooking = ({ item: b }) => {
        const sc = statusColors[b.status] || statusColors.scheduled;
        return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })} activeOpacity={0.7}>
                <View style={styles.cardTop}>
                    <View style={styles.bookingNumWrap}>
                        <Text style={styles.bookingNum}>{b.booking_number}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                        <View style={[styles.badgeDot, { backgroundColor: sc.dot }]} />
                        <Text style={[styles.badgeText, { color: sc.text }]}>{b.status.replace(/_/g, ' ')}</Text>
                    </View>
                </View>
                <Text style={styles.cardRoute}>{b.sender_name} → {b.receiver_name}</Text>
                <View style={styles.cardBottom}>
                    <Text style={styles.cardDir}>{b.direction === 'manila_to_bohol' ? 'Manila → Bohol' : 'Bohol → Manila'}</Text>
                    <Text style={styles.cardDate}>{formatDate(b.created_at)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Shipments</Text>
                <Text style={styles.subtitle}>{bookings.length} total shipments</Text>
            </View>
            <View style={styles.filterWrap}>
                <FlatList
                    horizontal showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={item => item || 'all'}
                    contentContainerStyle={{ paddingHorizontal: spacing.base }}
                    renderItem={({ item: f }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, filter === f && styles.filterActive]}
                            onPress={() => setFilter(f)} activeOpacity={0.7}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f ? f.replace(/_/g, ' ') : 'All'}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderBooking}
                    contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['2xl'] }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor={colors.orange[500]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Package size={40} color={colors.gray[300]} />
                            <Text style={styles.emptyTitle}>No shipments found</Text>
                            <Text style={styles.emptyText}>Book a shipment from the Home tab</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
        backgroundColor: colors.navy[800],
        paddingTop: Platform.OS === 'ios' ? 64 : 48,
        paddingBottom: spacing.base, paddingHorizontal: spacing.lg,
    },
    title: { ...typography.h2, color: colors.white },
    subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    filterWrap: { backgroundColor: colors.white, paddingVertical: spacing.md, ...shadows.sm },
    filterChip: {
        paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
        borderRadius: radius.full, backgroundColor: colors.gray[100], marginRight: spacing.sm,
    },
    filterActive: { backgroundColor: colors.orange[500], ...shadows.button },
    filterText: { ...typography.small, color: colors.gray[600], textTransform: 'capitalize' },
    filterTextActive: { color: colors.white },
    card: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.sm,
        ...shadows.card,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    bookingNumWrap: { backgroundColor: colors.navy[50], paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.sm },
    bookingNum: { ...typography.mono, color: colors.navy[700] },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.full, gap: 5 },
    badgeDot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize', fontSize: 11 },
    cardRoute: { ...typography.caption, color: colors.gray[600], marginBottom: spacing.sm },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    cardDir: { ...typography.small, color: colors.gray[400] },
    cardDate: { ...typography.small, color: colors.gray[400] },
    empty: { alignItems: 'center', paddingTop: spacing['5xl'] },
    emptyTitle: { ...typography.bodyMedium, color: colors.gray[600], marginTop: spacing.md },
    emptyText: { ...typography.caption, color: colors.gray[400], marginTop: spacing.xs },
});
