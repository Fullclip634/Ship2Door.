import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { tripAPI, announcementAPI, bookingAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate, directionLabel, statusColors } from '../theme';
import { Megaphone, Ship, ChevronRight } from 'lucide-react-native';

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
                <View style={{ flex: 1 }}>
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
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Announcements</Text>
                    </View>
                    {announcements.slice(0, 3).map(a => (
                        <View key={a.id} style={styles.announcementCard}>
                            <View style={styles.announcementAccent} />
                            <View style={styles.announcementContent}>
                                <View style={styles.announcementTop}>
                                    <Megaphone size={14} color={colors.orange[500]} />
                                    <Text style={styles.announcementTitle}>{a.title}</Text>
                                </View>
                                <Text style={styles.announcementMsg} numberOfLines={2}>{a.message}</Text>
                                <Text style={styles.announcementDate}>{formatDate(a.created_at)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Active Trips */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Trips</Text>
                </View>
                {trips.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ship size={32} color={colors.gray[300]} />
                        <Text style={styles.emptyText}>No active trips right now</Text>
                        <Text style={styles.emptySubtext}>Check back later for new trips</Text>
                    </View>
                ) : (
                    trips.map(trip => (
                        <TouchableOpacity key={trip.id} style={styles.tripCard}
                            onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })} activeOpacity={0.7}>
                            <View style={styles.tripRow}>
                                <View style={[styles.dirBadge, { backgroundColor: trip.direction === 'manila_to_bohol' ? colors.orange[50] : colors.navy[50] }]}>
                                    <Text style={[styles.dirText, { color: trip.direction === 'manila_to_bohol' ? colors.orange[700] : colors.navy[600] }]}>
                                        {directionLabel(trip.direction)}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: (statusColors[trip.status] || statusColors.scheduled).bg }]}>
                                    <View style={[styles.statusDot, { backgroundColor: (statusColors[trip.status] || statusColors.scheduled).dot }]} />
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
                            <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}
                                onPress={() => navigation.navigate('BookShipment', { tripId: trip.id, direction: trip.direction })}>
                                <Text style={styles.bookBtnText}>Book Shipment</Text>
                                <ChevronRight size={16} color={colors.white} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* My Active Bookings */}
            {myBookings.length > 0 && (
                <View style={[styles.section, { marginBottom: spacing['2xl'] }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Shipments</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Bookings')} activeOpacity={0.6}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {myBookings.slice(0, 3).map(b => (
                        <TouchableOpacity key={b.id} style={styles.bookingCard}
                            onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })} activeOpacity={0.7}>
                            <View style={styles.tripRow}>
                                <View style={styles.bookingNumWrap}>
                                    <Text style={styles.bookingNumber}>{b.booking_number}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: (statusColors[b.status] || statusColors.scheduled).bg }]}>
                                    <View style={[styles.statusDot, { backgroundColor: (statusColors[b.status] || statusColors.scheduled).dot }]} />
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

            <View style={{ height: spacing.xl }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingTop: Platform.OS === 'ios' ? 64 : 48,
        paddingBottom: spacing.xl, backgroundColor: colors.navy[800],
    },
    greeting: { ...typography.caption, color: 'rgba(255,255,255,0.5)' },
    userName: { ...typography.h2, color: colors.white, marginTop: 2 },
    avatar: {
        width: 48, height: 48, borderRadius: 16,
        backgroundColor: colors.orange[500], alignItems: 'center', justifyContent: 'center',
        ...shadows.md,
    },
    avatarText: { color: colors.white, fontSize: 20, fontFamily: 'Inter_700Bold' },
    section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.gray[900] },
    seeAll: { ...typography.label, color: colors.orange[500] },

    // Announcements
    announcementCard: {
        flexDirection: 'row', backgroundColor: colors.white,
        borderRadius: radius.lg, marginBottom: spacing.sm, overflow: 'hidden',
        ...shadows.card,
    },
    announcementAccent: { width: 4, backgroundColor: colors.orange[400] },
    announcementContent: { flex: 1, padding: spacing.base },
    announcementTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    announcementTitle: { ...typography.bodySemiBold, color: colors.gray[900] },
    announcementMsg: { ...typography.caption, color: colors.gray[500], lineHeight: 20 },
    announcementDate: { ...typography.small, color: colors.gray[400], marginTop: spacing.sm, fontSize: 11 },

    // Trips
    tripCard: {
        backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing.lg, marginBottom: spacing.md,
        ...shadows.card,
    },
    tripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    dirBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full },
    dirText: { ...typography.small, fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs + 1, borderRadius: radius.full, gap: 5 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize', fontSize: 11 },
    tripInfo: { flexDirection: 'row', gap: spacing.base, marginBottom: spacing.md },
    tripInfoItem: {},
    tripLabel: { ...typography.overline, color: colors.gray[400], marginBottom: 3, fontSize: 10 },
    tripValue: { ...typography.bodySemiBold, color: colors.gray[800] },
    bookBtn: {
        flexDirection: 'row', backgroundColor: colors.orange[500], borderRadius: radius.md,
        paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
        ...shadows.button,
    },
    bookBtnText: { ...typography.button, color: colors.white, fontSize: 14 },

    // Bookings
    bookingCard: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.sm,
        ...shadows.card,
    },
    bookingNumWrap: {
        backgroundColor: colors.navy[50], paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xs, borderRadius: radius.sm,
    },
    bookingNumber: { ...typography.mono, color: colors.navy[700] },
    bookingInfo: { ...typography.caption, color: colors.gray[500], marginTop: spacing.sm },
    bookingDate: { ...typography.small, color: colors.gray[400], marginTop: spacing.xs, fontSize: 11 },

    // Empty
    emptyCard: {
        backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing['3xl'], alignItems: 'center',
        ...shadows.card,
    },
    emptyText: { ...typography.bodyMedium, color: colors.gray[600], marginTop: spacing.md },
    emptySubtext: { ...typography.caption, color: colors.gray[400], marginTop: spacing.xs },
});
