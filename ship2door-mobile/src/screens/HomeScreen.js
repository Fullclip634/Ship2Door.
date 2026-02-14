import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { tripAPI, announcementAPI, bookingAPI } from '../services/api';
import { colors, formatDate, directionLabel, statusColors } from '../theme';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [tripsRes, annRes, bookRes] = await Promise.all([
                tripAPI.getActive(),
                announcementAPI.getAll({ limit: 5 }),
                bookingAPI.getMy({ limit: 5 }),
            ]);
            setTrips(tripsRes.data.data);
            setAnnouncements(annRes.data.data);
            setMyBookings(bookRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const onRefresh = () => { setRefreshing(true); loadData(); };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>;
    }

    return (
        <ScrollView style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange[500]} />}
            showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
                </View>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
            </View>

            {/* Announcements */}
            {announcements.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Announcements</Text>
                    {announcements.slice(0, 3).map(a => (
                        <View key={a.id} style={styles.announcementCard}>
                            <Text style={styles.announcementTitle}>{a.title}</Text>
                            <Text style={styles.announcementMsg}>{a.message}</Text>
                            <Text style={styles.announcementDate}>{formatDate(a.created_at)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Active Trips */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Trips</Text>
                {trips.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No active trips right now</Text>
                        <Text style={styles.emptySubtext}>Check back later for new trips</Text>
                    </View>
                ) : (
                    trips.map(trip => (
                        <TouchableOpacity key={trip.id} style={styles.tripCard}
                            onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}>
                            <View style={styles.tripRow}>
                                <View style={[styles.dirBadge, { backgroundColor: trip.direction === 'manila_to_bohol' ? colors.orange[50] : colors.navy[50] }]}>
                                    <Text style={[styles.dirText, { color: trip.direction === 'manila_to_bohol' ? colors.orange[700] : colors.navy[600] }]}>
                                        {directionLabel(trip.direction)}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: (statusColors[trip.status] || statusColors.scheduled).bg }]}>
                                    <Text style={[styles.statusText, { color: (statusColors[trip.status] || statusColors.scheduled).text }]}>
                                        {trip.status.replace(/_/g, ' ')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.tripInfo}>
                                <View style={styles.tripInfoItem}>
                                    <Text style={styles.tripLabel}>Departure</Text>
                                    <Text style={styles.tripValue}>{formatDate(trip.departure_date)}</Text>
                                </View>
                                <View style={styles.tripInfoItem}>
                                    <Text style={styles.tripLabel}>Est. Arrival</Text>
                                    <Text style={styles.tripValue}>{formatDate(trip.estimated_arrival)}</Text>
                                </View>
                                {trip.booking_cutoff && (
                                    <View style={styles.tripInfoItem}>
                                        <Text style={styles.tripLabel}>Cutoff</Text>
                                        <Text style={[styles.tripValue, { color: colors.danger[500] }]}>{formatDate(trip.booking_cutoff)}</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity style={styles.bookBtn}
                                onPress={() => navigation.navigate('BookShipment', { tripId: trip.id, direction: trip.direction })}>
                                <Text style={styles.bookBtnText}>Book Shipment</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* My Active Bookings */}
            {myBookings.length > 0 && (
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Shipments</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {myBookings.slice(0, 3).map(b => (
                        <TouchableOpacity key={b.id} style={styles.bookingCard}
                            onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}>
                            <View style={styles.tripRow}>
                                <Text style={styles.bookingNumber}>{b.booking_number}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: (statusColors[b.status] || statusColors.scheduled).bg }]}>
                                    <Text style={[styles.statusText, { color: (statusColors[b.status] || statusColors.scheduled).text }]}>
                                        {b.status.replace(/_/g, ' ')}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.bookingInfo}>{b.sender_name} → {b.receiver_name}</Text>
                            <Text style={styles.bookingDate}>{formatDate(b.created_at)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.navy[800] },
    greeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    userName: { fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.5, marginTop: 2 },
    avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.orange[500], alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray[900], letterSpacing: -0.3, marginBottom: 12 },
    seeAll: { fontSize: 13, fontWeight: '600', color: colors.orange[500] },
    announcementCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.gray[200] },
    announcementTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginBottom: 4 },
    announcementMsg: { fontSize: 13, color: colors.gray[600], lineHeight: 20 },
    announcementDate: { fontSize: 11, color: colors.gray[400], marginTop: 8 },
    tripCard: { backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
    tripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    dirBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    dirText: { fontSize: 12, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    tripInfo: { flexDirection: 'row', gap: 16, marginBottom: 14 },
    tripInfoItem: {},
    tripLabel: { fontSize: 11, fontWeight: '500', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    tripValue: { fontSize: 14, fontWeight: '600', color: colors.gray[800] },
    bookBtn: { backgroundColor: colors.orange[500], borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    bookBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
    bookingCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.gray[200] },
    bookingNumber: { fontSize: 14, fontWeight: '700', color: colors.navy[700], fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    bookingInfo: { fontSize: 13, color: colors.gray[600], marginTop: 6 },
    bookingDate: { fontSize: 11, color: colors.gray[400], marginTop: 4 },
    emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.gray[200] },
    emptyText: { fontSize: 15, fontWeight: '600', color: colors.gray[600] },
    emptySubtext: { fontSize: 13, color: colors.gray[400], marginTop: 4 },
});
