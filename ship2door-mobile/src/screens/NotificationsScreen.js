import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { notificationAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate } from '../theme';
import { Bell, BellOff } from 'lucide-react-native';

const typeColors = {
    status_update: { bg: '#EFF6FF', dot: '#3B82F6' },
    pickup_reminder: { bg: '#FFFBEB', dot: '#EAB308' },
    announcement: { bg: colors.orange[50], dot: colors.orange[500] },
    delay: { bg: '#FEF2F2', dot: '#EF4444' },
    delivery: { bg: '#F0FDF4', dot: '#22C55E' },
};

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const markRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const renderItem = ({ item: n }) => {
        const tc = typeColors[n.type] || typeColors.status_update;
        return (
            <TouchableOpacity
                style={[styles.card, !n.is_read && styles.unread]}
                onPress={() => !n.is_read && markRead(n.id)} activeOpacity={0.7}
            >
                {!n.is_read && <View style={styles.unreadAccent} />}
                <View style={[styles.dotWrap, { backgroundColor: tc.bg }]}>
                    <View style={[styles.dot, { backgroundColor: tc.dot }]} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, !n.is_read && styles.titleUnread]} numberOfLines={1}>{n.title}</Text>
                        {!n.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message} numberOfLines={2}>{n.message}</Text>
                    <Text style={styles.date}>{formatDate(n.created_at)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSub}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.7}>
                        <Text style={styles.markAllText}>Mark All Read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['2xl'] }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.orange[500]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <BellOff size={40} color={colors.gray[300]} />
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptyText}>No notifications yet</Text>
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
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    headerTitle: { ...typography.h2, color: colors.white },
    headerSub: { ...typography.caption, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    markAllBtn: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.sm,
    },
    markAllText: { ...typography.small, color: colors.white, fontWeight: '600' },
    card: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.sm,
        flexDirection: 'row', gap: spacing.md, overflow: 'hidden',
        ...shadows.card,
    },
    unread: { backgroundColor: '#FFFAF5' },
    unreadAccent: {
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, backgroundColor: colors.orange[400], borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg,
    },
    dotWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.bodySemiBold, color: colors.gray[900], flex: 1 },
    titleUnread: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
    unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange[500] },
    message: { ...typography.caption, color: colors.gray[500], lineHeight: 20, marginTop: spacing.xs },
    date: { ...typography.small, color: colors.gray[400], marginTop: spacing.sm, fontSize: 11 },
    empty: { alignItems: 'center', paddingTop: spacing['5xl'] },
    emptyTitle: { ...typography.bodyMedium, color: colors.gray[600], marginTop: spacing.md },
    emptyText: { ...typography.caption, color: colors.gray[400], marginTop: spacing.xs },
});
