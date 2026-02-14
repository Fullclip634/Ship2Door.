import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { tripAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate, statusColors, directionLabel } from '../theme';
import { Check, Clock, AlertTriangle, FileText } from 'lucide-react-native';

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
    if (!trip) return <View style={styles.center}><Text style={styles.notFound}>Trip not found.</Text></View>;

    const currentIdx = tripStatuses.indexOf(trip.status);
    const sc = statusColors[trip.status] || statusColors.scheduled;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.dirLabel}>{directionLabel(trip.direction)}</Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <View style={[styles.badgeDot, { backgroundColor: sc.dot }]} />
                    <Text style={[styles.badgeText, { color: sc.text }]}>{trip.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>

            {/* Info Row */}
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

            {/* Progress Timeline */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Trip Progress</Text>
                <View style={styles.timeline}>
                    {tripStatuses.map((s, i) => {
                        const done = i <= currentIdx;
                        const current = i === currentIdx;
                        const isLast = i === tripStatuses.length - 1;
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

            {/* Delay Notice */}
            {trip.delay_reason && (
                <View style={styles.delayCard}>
                    <View style={styles.delayHeader}>
                        <AlertTriangle size={16} color={colors.danger[600]} />
                        <Text style={styles.delayTitle}>Delay Notice</Text>
                    </View>
                    <Text style={styles.delayText}>{trip.delay_reason}</Text>
                </View>
            )}

            {/* Notes */}
            {trip.notes && (
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                        <FileText size={14} color={colors.orange[500]} />
                        <Text style={styles.cardTitle}>Trip Notes</Text>
                    </View>
                    <Text style={styles.notesText}>{trip.notes}</Text>
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
    dirLabel: { ...typography.h2, color: colors.navy[700] },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, gap: 6 },
    badgeDot: { width: 7, height: 7, borderRadius: 4 },
    badgeText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
    infoRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.base },
    infoItem: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base, ...shadows.card },
    infoLabel: { ...typography.overline, color: colors.gray[400], marginBottom: spacing.xs },
    infoValue: { ...typography.bodyMedium, color: colors.gray[900], fontWeight: '600' },
    card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, ...shadows.card },
    cardTitle: { ...typography.bodySemiBold, color: colors.gray[800], letterSpacing: -0.2 },

    // Timeline
    timeline: { paddingLeft: spacing.xs, marginTop: spacing.xs },
    timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
    timelineLeft: { alignItems: 'center', width: 24 },
    timelineDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' },
    timelineDotDone: { backgroundColor: colors.success[500] },
    timelineDotCurrent: { backgroundColor: colors.orange[500] },
    timelineLine: { width: 2, height: 24, backgroundColor: colors.gray[200], marginVertical: 2 },
    timelineLineDone: { backgroundColor: colors.success[500] },
    timelineLabel: { ...typography.caption, color: colors.gray[400], textTransform: 'capitalize', marginLeft: spacing.md, marginTop: 2, lineHeight: 20 },
    timelineLabelDone: { color: colors.gray[700] },
    timelineLabelCurrent: { color: colors.orange[600], fontFamily: 'Inter_700Bold', fontWeight: '700' },

    // Delay
    delayCard: { backgroundColor: colors.danger[50], borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.danger[100] },
    delayHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    delayTitle: { ...typography.bodySemiBold, color: colors.danger[700] },
    delayText: { ...typography.body, color: colors.danger[700], lineHeight: 22 },
    notesText: { ...typography.body, color: colors.gray[600], lineHeight: 22 },
});
