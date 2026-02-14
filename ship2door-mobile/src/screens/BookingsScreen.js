import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bookingAPI } from '../services/api';
import { colors, formatDate, statusColors } from '../theme';

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
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}>
                <View style={styles.cardTop}>
                    <Text style={styles.bookingNum}>{b.booking_number}</Text>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}><Text style={[styles.badgeText, { color: sc.text }]}>{b.status.replace(/_/g, ' ')}</Text></View>
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
            </View>
            <View style={styles.filterWrap}>
                <FlatList
                    horizontal showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={item => item || 'all'}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({ item: f }) => (
                        <TouchableOpacity style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
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
                    contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
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
    header: { backgroundColor: colors.navy[800], paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
    title: { fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
    filterWrap: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[200], paddingVertical: 12 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.gray[100], marginRight: 8 },
    filterActive: { backgroundColor: colors.orange[500] },
    filterText: { fontSize: 12, fontWeight: '600', color: colors.gray[600], textTransform: 'capitalize' },
    filterTextActive: { color: colors.white },
    card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.gray[200] },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bookingNum: { fontSize: 14, fontWeight: '700', color: colors.navy[700] },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    cardRoute: { fontSize: 13, color: colors.gray[600], marginBottom: 10 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    cardDir: { fontSize: 12, fontWeight: '500', color: colors.gray[400] },
    cardDate: { fontSize: 12, color: colors.gray[400] },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[600] },
    emptyText: { fontSize: 13, color: colors.gray[400], marginTop: 4 },
});
