import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { tripAPI } from '../services/api';
import { colors, formatDate, statusColors, directionLabel } from '../theme';

const tripStatuses = ['scheduled', 'picking_up', 'departed', 'in_transit', 'delayed', 'arrived', 'delivering', 'completed'];

export default function TripDetailScreen({ route }) {
    const { tripId } = route.params;
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tripAPI.getOne(tripId)
            .then(res => setTrip(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tripId]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>;
    if (!trip) return <View style={styles.center}><Text>Trip not found.</Text></View>;

    const currentIdx = tripStatuses.indexOf(trip.status);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.dirLabel}>{directionLabel(trip.direction)}</Text>
                <View style={[styles.badge, { backgroundColor: (statusColors[trip.status] || statusColors.scheduled).bg }]}>
                    <Text style={[styles.badgeText, { color: (statusColors[trip.status] || statusColors.scheduled).text }]}>{trip.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Departure</Text>
                    <Text style={styles.infoValue}>{formatDate(trip.departure_date)}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Est. Arrival</Text>
                    <Text style={styles.infoValue}>{formatDate(trip.estimated_arrival)}</Text>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Trip Progress</Text>
                {tripStatuses.map((s, i) => {
                    const done = i <= currentIdx;
                    const current = i === currentIdx;
                    return (
                        <View key={s} style={styles.stepRow}>
                            <View style={[styles.stepDot, done && styles.stepDone, current && styles.stepCurrent]} />
                            <Text style={[styles.stepLabel, done && styles.stepLabelDone, current && styles.stepLabelCurrent]}>{s.replace(/_/g, ' ')}</Text>
                        </View>
                    );
                })}
            </View>

            {trip.delay_reason && (
                <View style={[styles.card, { backgroundColor: colors.danger[50], borderColor: '#FCA5A5' }]}>
                    <Text style={[styles.cardTitle, { color: colors.danger[700] }]}>Delay Notice</Text>
                    <Text style={{ fontSize: 14, color: colors.danger[700], lineHeight: 22 }}>{trip.delay_reason}</Text>
                </View>
            )}

            {trip.notes && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Trip Notes</Text>
                    <Text style={{ fontSize: 14, color: colors.gray[600], lineHeight: 22 }}>{trip.notes}</Text>
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
    dirLabel: { fontSize: 20, fontWeight: '800', color: colors.navy[700], letterSpacing: -0.5 },
    badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    infoRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    infoItem: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.gray[200] },
    infoLabel: { fontSize: 11, fontWeight: '500', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    infoValue: { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
    card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
    cardTitle: { fontSize: 14, fontWeight: '700', color: colors.gray[800], marginBottom: 12 },
    stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 4 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gray[200], marginRight: 12 },
    stepDone: { backgroundColor: colors.success[500] },
    stepCurrent: { backgroundColor: colors.orange[500], width: 12, height: 12, borderRadius: 6 },
    stepLabel: { fontSize: 13, color: colors.gray[400], textTransform: 'capitalize', fontWeight: '500' },
    stepLabelDone: { color: colors.gray[700] },
    stepLabelCurrent: { color: colors.orange[600], fontWeight: '700' },
});
