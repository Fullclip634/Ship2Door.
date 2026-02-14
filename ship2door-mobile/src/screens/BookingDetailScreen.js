import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, Dimensions, useWindowDimensions
} from 'react-native';
import { bookingAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate, statusColors } from '../theme';
import { Check, Clock, Package, User, Phone, MapPin, FileText, Calendar } from 'lucide-react-native';

export default function BookingDetailScreen({ route }) {
    const { bookingId } = route.params;
    const { width } = useWindowDimensions();
    const isNarrow = width < 380;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bookingAPI.getOne(bookingId)
            .then(res => setBooking(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>;
    if (!booking) return <View style={styles.center}><Text style={styles.notFound}>Booking not found.</Text></View>;

    const sc = statusColors[booking.status] || statusColors.scheduled;
    const allStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered'];
    const currentIdx = allStatuses.indexOf(booking.status);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.bookingNumWrap}>
                    <Text style={styles.bookingNum}>{booking.booking_number}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <View style={[styles.badgeDot, { backgroundColor: sc.dot }]} />
                    <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>

            {/* Progress Timeline */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Tracking Progress</Text>
                <View style={styles.timeline}>
                    {allStatuses.map((s, i) => {
                        const done = i <= currentIdx;
                        const current = i === currentIdx;
                        const isLast = i === allStatuses.length - 1;
                        return (
                            <View key={s} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={[
                                        styles.timelineDot,
                                        done && styles.timelineDotDone,
                                        current && styles.timelineDotCurrent,
                                    ]}>
                                        {done && !current && <Check size={10} color={colors.white} strokeWidth={3} />}
                                        {current && <Clock size={10} color={colors.white} strokeWidth={3} />}
                                    </View>
                                    {!isLast && (
                                        <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.timelineLabel,
                                    done && styles.timelineLabelDone,
                                    current && styles.timelineLabelCurrent,
                                ]}>{s.replace(/_/g, ' ')}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Sender & Receiver */}
            <View style={[styles.row, isNarrow && styles.rowVertical]}>
                <View style={[styles.card, !isNarrow && { flex: 1 }]}>
                    <View style={styles.cardTitleRow}>
                        <User size={14} color={colors.orange[500]} />
                        <Text style={styles.cardTitle}>Sender</Text>
                    </View>
                    <Text style={styles.infoName}>{booking.sender_name}</Text>
                    <View style={styles.infoRow}>
                        <Phone size={12} color={colors.gray[400]} />
                        <Text style={styles.infoText}>{booking.sender_phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin size={12} color={colors.gray[400]} />
                        <Text style={styles.infoText}>{booking.sender_address}</Text>
                    </View>
                </View>
                <View style={[styles.card, !isNarrow && { flex: 1 }]}>
                    <View style={styles.cardTitleRow}>
                        <User size={14} color={colors.navy[500]} />
                        <Text style={styles.cardTitle}>Receiver</Text>
                    </View>
                    <Text style={styles.infoName}>{booking.receiver_name}</Text>
                    <View style={styles.infoRow}>
                        <Phone size={12} color={colors.gray[400]} />
                        <Text style={styles.infoText}>{booking.receiver_phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin size={12} color={colors.gray[400]} />
                        <Text style={styles.infoText}>{booking.receiver_address}</Text>
                    </View>
                </View>
            </View>

            {/* Items */}
            {booking.items && booking.items.length > 0 && (
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Package size={14} color={colors.orange[500]} />
                        <Text style={styles.cardTitle}>Items ({booking.items.length})</Text>
                    </View>
                    {booking.items.map((item, i) => (
                        <View key={item.id} style={[styles.itemRow, i === booking.items.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.itemNum}>
                                <Text style={styles.itemNumText}>{i + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemDesc}>{item.description}</Text>
                                <Text style={styles.itemMeta}>
                                    Qty: {item.quantity}{item.size_estimate ? ` • ${item.size_estimate}` : ''}{item.weight_estimate ? ` • ${item.weight_estimate}kg` : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Instructions */}
            {booking.special_instructions && (
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <FileText size={14} color={colors.orange[500]} />
                        <Text style={styles.cardTitle}>Special Instructions</Text>
                    </View>
                    <Text style={styles.instructions}>{booking.special_instructions}</Text>
                </View>
            )}

            {/* Pickup */}
            {booking.pickup_date && (
                <View style={styles.pickupCard}>
                    <View style={styles.cardTitleRow}>
                        <Calendar size={14} color={colors.orange[600]} />
                        <Text style={[styles.cardTitle, { color: colors.orange[700] }]}>Scheduled Pickup</Text>
                    </View>
                    <Text style={styles.infoName}>{formatDate(booking.pickup_date)}</Text>
                    {booking.pickup_time_window && <Text style={styles.infoText}>{booking.pickup_time_window}</Text>}
                </View>
            )}

            <View style={{ height: spacing['2xl'] }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.lg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] },
    notFound: { ...typography.bodyMedium, color: colors.gray[500] },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.sm },
    bookingNumWrap: { backgroundColor: colors.navy[50], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
    bookingNum: { fontSize: 18, fontWeight: '800', color: colors.navy[700], letterSpacing: -0.3, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, gap: 6 },
    badgeDot: { width: 7, height: 7, borderRadius: 4 },
    badgeText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
    card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, ...shadows.card },
    cardTitle: { ...typography.bodySemiBold, color: colors.gray[800], letterSpacing: -0.2 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm },
    rowVertical: { flexDirection: 'column' },

    // Timeline
    timeline: { paddingLeft: spacing.xs },
    timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
    timelineLeft: { alignItems: 'center', width: 24 },
    timelineDot: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: colors.gray[200],
        alignItems: 'center', justifyContent: 'center',
    },
    timelineDotDone: { backgroundColor: colors.success[500] },
    timelineDotCurrent: { backgroundColor: colors.orange[500] },
    timelineLine: { width: 2, height: 24, backgroundColor: colors.gray[200], marginVertical: 2 },
    timelineLineDone: { backgroundColor: colors.success[500] },
    timelineLabel: { ...typography.caption, color: colors.gray[400], textTransform: 'capitalize', marginLeft: spacing.md, marginTop: 2, lineHeight: 20 },
    timelineLabelDone: { color: colors.gray[700] },
    timelineLabelCurrent: { color: colors.orange[600], fontFamily: 'Inter_700Bold', fontWeight: '700' },

    // Info
    infoName: { ...typography.bodyMedium, color: colors.gray[900], marginBottom: spacing.xs },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.xs },
    infoText: { ...typography.caption, color: colors.gray[500], lineHeight: 20, flex: 1 },

    // Items
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[100], gap: spacing.md },
    itemNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
    itemNumText: { ...typography.small, color: colors.gray[600], fontWeight: '700' },
    itemDesc: { ...typography.bodyMedium, color: colors.gray[800] },
    itemMeta: { ...typography.small, color: colors.gray[400], marginTop: 2 },
    instructions: { ...typography.body, color: colors.gray[700], lineHeight: 22 },

    // Pickup
    pickupCard: {
        backgroundColor: colors.orange[50], borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.orange[200],
    },
});
