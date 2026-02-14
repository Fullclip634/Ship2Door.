import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { notificationAPI } from '../services/api';
import { colors, formatDate } from '../theme';

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
            <TouchableOpacity style={[styles.card, !n.is_read && styles.unread]} onPress={() => !n.is_read && markRead(n.id)}>
                <View style={[styles.dot, { backgroundColor: tc.dot }]} />
                <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, !n.is_read && { fontWeight: '700' }]}>{n.title}</Text>
                        {!n.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message}>{n.message}</Text>
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
                    <Text style={styles.headerSub}>{unreadCount} unread</Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
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
                    contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
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
    header: { backgroundColor: colors.navy[800], paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
    markAllText: { fontSize: 12, fontWeight: '600', color: colors.white },
    card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: colors.gray[200] },
    unread: { backgroundColor: '#FFFAF5', borderColor: colors.orange[100] },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { fontSize: 14, fontWeight: '500', color: colors.gray[900] },
    unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange[500] },
    message: { fontSize: 13, color: colors.gray[600], lineHeight: 20, marginTop: 4 },
    date: { fontSize: 11, color: colors.gray[400], marginTop: 6 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[600] },
    emptyText: { fontSize: 13, color: colors.gray[400], marginTop: 4 },
});
