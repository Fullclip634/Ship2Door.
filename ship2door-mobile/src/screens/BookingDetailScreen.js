import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform,
    useWindowDimensions, TouchableOpacity, Alert, TextInput
} from 'react-native';
import { bookingAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, formatDate, statusColors } from '../theme';
import { Check, Clock, Package, User, Phone, MapPin, FileText, Calendar, XCircle, Edit3, Save, X, Plus, Minus } from 'lucide-react-native';

export default function BookingDetailScreen({ route, navigation }) {
    const { bookingId } = route.params;
    const { width } = useWindowDimensions();
    const isNarrow = width < 380;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editItems, setEditItems] = useState([]);
    const [saving, setSaving] = useState(false);

    const loadBooking = () => {
        bookingAPI.getOne(bookingId)
            .then(res => {
                setBooking(res.data.data);
                initEditForm(res.data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const initEditForm = (b) => {
        setEditForm({
            sender_name: b.sender_name, sender_phone: b.sender_phone, sender_address: b.sender_address,
            receiver_name: b.receiver_name, receiver_phone: b.receiver_phone, receiver_address: b.receiver_address,
            special_instructions: b.special_instructions || '',
        });
        setEditItems(b.items?.map(i => ({
            description: i.description, quantity: String(i.quantity),
            size_estimate: i.size_estimate || '', weight_estimate: i.weight_estimate ? String(i.weight_estimate) : '',
        })) || [{ description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
    };

    useEffect(() => { loadBooking(); }, [bookingId]);

    const handleCancel = () => {
        Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking? This cannot be undone.', [
            { text: 'Keep Booking', style: 'cancel' },
            {
                text: 'Cancel Booking', style: 'destructive', onPress: async () => {
                    try {
                        await bookingAPI.cancel(bookingId);
                        Alert.alert('Cancelled', 'Your booking has been cancelled.');
                        loadBooking();
                    } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to cancel.');
                    }
                }
            },
        ]);
    };

    const handleSaveEdit = async () => {
        if (!editForm.sender_name || !editForm.receiver_name) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...editForm,
                items: editItems.filter(i => i.description).map(i => ({
                    ...i, quantity: parseInt(i.quantity) || 1,
                    weight_estimate: i.weight_estimate ? parseFloat(i.weight_estimate) : null
                }))
            };
            await bookingAPI.edit(bookingId, payload);
            Alert.alert('Saved', 'Booking updated successfully.');
            setEditing(false);
            setLoading(true);
            loadBooking();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update.');
        } finally { setSaving(false); }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.orange[500]} /></View>;
    if (!booking) return <View style={styles.center}><Text style={styles.notFound}>Booking not found.</Text></View>;

    const sc = statusColors[booking.status] || statusColors.scheduled;
    const allStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery', 'delivered'];
    const currentIdx = allStatuses.indexOf(booking.status);
    const isPending = booking.status === 'pending_pickup';

    // Edit mode
    if (editing && editForm) {
        const updateField = (key, val) => setEditForm(prev => ({ ...prev, [key]: val }));
        const updateItem = (idx, key, val) => { const copy = [...editItems]; copy[idx][key] = val; setEditItems(copy); };
        const addItem = () => setEditItems([...editItems, { description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
        const removeItem = (idx) => { if (editItems.length > 1) setEditItems(editItems.filter((_, i) => i !== idx)); };

        return (
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.editHeader}>
                    <Text style={styles.editTitle}>Edit Booking</Text>
                    <TouchableOpacity onPress={() => { setEditing(false); initEditForm(booking); }} activeOpacity={0.6}>
                        <X size={22} color={colors.gray[500]} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: spacing.lg, paddingTop: 0 }}>
                    <Text style={styles.editSectionTitle}>Sender</Text>
                    <TextInput style={styles.editInput} placeholder="Sender name" value={editForm.sender_name} onChangeText={v => updateField('sender_name', v)} placeholderTextColor={colors.gray[400]} />
                    <TextInput style={styles.editInput} placeholder="Sender phone" value={editForm.sender_phone} onChangeText={v => updateField('sender_phone', v)} keyboardType="phone-pad" placeholderTextColor={colors.gray[400]} />
                    <TextInput style={[styles.editInput, styles.editTextarea]} placeholder="Sender address" value={editForm.sender_address} onChangeText={v => updateField('sender_address', v)} multiline placeholderTextColor={colors.gray[400]} />

                    <Text style={styles.editSectionTitle}>Receiver</Text>
                    <TextInput style={styles.editInput} placeholder="Receiver name" value={editForm.receiver_name} onChangeText={v => updateField('receiver_name', v)} placeholderTextColor={colors.gray[400]} />
                    <TextInput style={styles.editInput} placeholder="Receiver phone" value={editForm.receiver_phone} onChangeText={v => updateField('receiver_phone', v)} keyboardType="phone-pad" placeholderTextColor={colors.gray[400]} />
                    <TextInput style={[styles.editInput, styles.editTextarea]} placeholder="Receiver address" value={editForm.receiver_address} onChangeText={v => updateField('receiver_address', v)} multiline placeholderTextColor={colors.gray[400]} />

                    <Text style={styles.editSectionTitle}>Items</Text>
                    {editItems.map((item, idx) => (
                        <View key={idx} style={styles.editItemCard}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                                <Text style={styles.editItemLabel}>Item {idx + 1}</Text>
                                {editItems.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(idx)} activeOpacity={0.6}>
                                        <Minus size={14} color={colors.danger[500]} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput style={styles.editInput} placeholder="Description" value={item.description} onChangeText={v => updateItem(idx, 'description', v)} placeholderTextColor={colors.gray[400]} />
                            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                                <TextInput style={[styles.editInput, { flex: 1 }]} placeholder="Qty" value={item.quantity} onChangeText={v => updateItem(idx, 'quantity', v)} keyboardType="numeric" placeholderTextColor={colors.gray[400]} />
                                <TextInput style={[styles.editInput, { flex: 1 }]} placeholder="Size" value={item.size_estimate} onChangeText={v => updateItem(idx, 'size_estimate', v)} placeholderTextColor={colors.gray[400]} />
                                <TextInput style={[styles.editInput, { flex: 1 }]} placeholder="kg" value={item.weight_estimate} onChangeText={v => updateItem(idx, 'weight_estimate', v)} keyboardType="numeric" placeholderTextColor={colors.gray[400]} />
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.6}>
                        <Plus size={16} color={colors.orange[500]} />
                        <Text style={styles.addItemText}>Add Item</Text>
                    </TouchableOpacity>

                    <Text style={styles.editSectionTitle}>Special Instructions</Text>
                    <TextInput style={[styles.editInput, styles.editTextarea]} placeholder="Any notes..." value={editForm.special_instructions} onChangeText={v => updateField('special_instructions', v)} multiline placeholderTextColor={colors.gray[400]} />

                    <TouchableOpacity style={styles.saveEditBtn} onPress={handleSaveEdit} disabled={saving} activeOpacity={0.85}>
                        {saving ? <ActivityIndicator color="white" /> : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                <Save size={16} color={colors.white} />
                                <Text style={styles.saveEditText}>Save Changes</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

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

            {/* Action Buttons for pending bookings */}
            {isPending && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)} activeOpacity={0.7}>
                        <Edit3 size={16} color={colors.orange[500]} />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
                        <XCircle size={16} color={colors.danger[500]} />
                        <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </TouchableOpacity>
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

    // Action buttons
    actionRow: {
        flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm,
    },
    editBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.orange[200],
        borderRadius: radius.md, height: 48,
    },
    editBtnText: { ...typography.bodySemiBold, color: colors.orange[500] },
    cancelBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.danger[200],
        borderRadius: radius.md, height: 48,
    },
    cancelBtnText: { ...typography.bodySemiBold, color: colors.danger[500] },

    // Edit mode styles
    editHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
        marginBottom: spacing.lg,
    },
    editTitle: { ...typography.h2, color: colors.gray[900] },
    editSectionTitle: { ...typography.h3, color: colors.gray[800], marginBottom: spacing.md, marginTop: spacing.md },
    editInput: {
        backgroundColor: colors.gray[50], borderWidth: 1.5, borderColor: colors.gray[200],
        borderRadius: radius.md, paddingHorizontal: spacing.base, height: 48,
        fontSize: 15, color: colors.gray[900], fontFamily: 'Inter_400Regular',
        marginBottom: spacing.sm,
    },
    editTextarea: { height: 80, textAlignVertical: 'top', paddingTop: spacing.md },
    editItemCard: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.sm,
        ...shadows.card,
    },
    editItemLabel: { ...typography.label, color: colors.navy[600] },
    addItemBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        borderWidth: 1.5, borderColor: colors.orange[200], borderStyle: 'dashed',
        borderRadius: radius.md, paddingVertical: spacing.md, marginBottom: spacing.md,
        backgroundColor: colors.orange[50],
    },
    addItemText: { ...typography.bodySemiBold, color: colors.orange[500] },
    saveEditBtn: {
        backgroundColor: colors.orange[500], borderRadius: radius.md,
        height: 52, alignItems: 'center', justifyContent: 'center',
        marginTop: spacing.md, ...shadows.button,
    },
    saveEditText: { ...typography.button, color: colors.white },
});
