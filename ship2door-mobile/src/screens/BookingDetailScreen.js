import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { bookingAPI } from '../services/api';
import { colors, formatDate, statusColors } from '../theme';

export default function BookingDetailScreen({ route }) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bookingAPI.getOne(bookingId)
            .then(res => setBooking(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>;
    if (!booking) return <View style={styles.center}><Text>Booking not found.</Text></View>;

    const sc = statusColors[booking.status] || statusColors.scheduled;

    const StatusStep = ({ label, done, current }) => (
        <View style={styles.stepRow}>
            <View style={[styles.stepDot, done && styles.stepDone, current && styles.stepCurrent]} />
            <Text style={[styles.stepLabel, done && styles.stepLabelDone, current && styles.stepLabelCurrent]}>{label}</Text>
        </View>
    );

    const allStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered'];
    const currentIdx = allStatuses.indexOf(booking.status);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.bookingNum}>{booking.booking_number}</Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.text }]}>{booking.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Tracking Progress</Text>
                {allStatuses.map((s, i) => (
                    <StatusStep key={s} label={s.replace(/_/g, ' ')} done={i <= currentIdx} current={i === currentIdx} />
                ))}
            </View>

            {/* Sender & Receiver */}
            <View style={styles.row}>
                <View style={[styles.card, { flex: 1 }]}>
                    <Text style={styles.cardTitle}>Sender</Text>
                    <Text style={styles.infoName}>{booking.sender_name}</Text>
                    <Text style={styles.infoText}>{booking.sender_phone}</Text>
                    <Text style={styles.infoText}>{booking.sender_address}</Text>
                </View>
                <View style={[styles.card, { flex: 1 }]}>
                    <Text style={styles.cardTitle}>Receiver</Text>
                    <Text style={styles.infoName}>{booking.receiver_name}</Text>
                    <Text style={styles.infoText}>{booking.receiver_phone}</Text>
                    <Text style={styles.infoText}>{booking.receiver_address}</Text>
                </View>
            </View>

            {/* Items */}
            {booking.items && booking.items.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Items ({booking.items.length})</Text>
                    {booking.items.map((item, i) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemDesc}>{item.description}</Text>
                            <Text style={styles.itemMeta}>
                                Qty: {item.quantity}{item.size_estimate ? ` • ${item.size_estimate}` : ''}{item.weight_estimate ? ` • ${item.weight_estimate}kg` : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Instructions */}
            {booking.special_instructions && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Special Instructions</Text>
                    <Text style={styles.instructions}>{booking.special_instructions}</Text>
                </View>
            )}

            {/* Pickup */}
            {booking.pickup_date && (
                <View style={[styles.card, { backgroundColor: colors.orange[50], borderColor: colors.orange[200] }]}>
                    <Text style={[styles.cardTitle, { color: colors.orange[700] }]}>Scheduled Pickup</Text>
                    <Text style={styles.infoName}>{formatDate(booking.pickup_date)}</Text>
                    {booking.pickup_time_window && <Text style={styles.infoText}>{booking.pickup_time_window}</Text>}
                </View>
            )}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50], padding: 20 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 10 },
    bookingNum: { fontSize: 20, fontWeight: '800', color: colors.navy[700], letterSpacing: -0.5 },
    badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
    cardTitle: { fontSize: 14, fontWeight: '700', color: colors.gray[800], marginBottom: 12, letterSpacing: -0.2 },
    row: { flexDirection: 'row', gap: 10 },
    stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 4 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gray[200], marginRight: 12 },
    stepDone: { backgroundColor: colors.success[500] },
    stepCurrent: { backgroundColor: colors.orange[500], width: 12, height: 12, borderRadius: 6 },
    stepLabel: { fontSize: 13, color: colors.gray[400], textTransform: 'capitalize', fontWeight: '500' },
    stepLabelDone: { color: colors.gray[700] },
    stepLabelCurrent: { color: colors.orange[600], fontWeight: '700' },
    infoName: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginBottom: 4 },
    infoText: { fontSize: 13, color: colors.gray[500], lineHeight: 20 },
    itemRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
    itemDesc: { fontSize: 14, fontWeight: '500', color: colors.gray[800] },
    itemMeta: { fontSize: 12, color: colors.gray[400], marginTop: 2 },
    instructions: { fontSize: 14, color: colors.gray[700], lineHeight: 22 },
});
