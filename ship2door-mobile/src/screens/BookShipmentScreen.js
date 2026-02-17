import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { bookingAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing, directionLabel } from '../theme';
import { Plus, Minus, Send, ArrowLeft, ChevronRight, User, Phone, MapPin, Package, FileText } from 'lucide-react-native';

export default function BookShipmentScreen({ route, navigation }) {
    const { tripId, direction } = route.params;
    const [form, setForm] = useState({
        sender_name: '', sender_phone: '', sender_address: '',
        receiver_name: '', receiver_phone: '', receiver_address: '',
        special_instructions: '',
    });
    const [items, setItems] = useState([{ description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSummary, setShowSummary] = useState(false);

    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };
    const updateItem = (idx, key, val) => {
        const copy = [...items];
        copy[idx][key] = val;
        setItems(copy);
        if (errors[`item_${idx}`]) setErrors(prev => ({ ...prev, [`item_${idx}`]: null }));
    };
    const addItem = () => setItems([...items, { description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
    const removeItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

    const validate = () => {
        const errs = {};
        if (!form.sender_name.trim()) errs.sender_name = 'Sender name is required';
        if (!form.sender_phone.trim()) errs.sender_phone = 'Sender phone is required';
        if (!form.sender_address.trim()) errs.sender_address = 'Sender address is required';
        if (!form.receiver_name.trim()) errs.receiver_name = 'Receiver name is required';
        if (!form.receiver_phone.trim()) errs.receiver_phone = 'Receiver phone is required';
        if (!form.receiver_address.trim()) errs.receiver_address = 'Receiver address is required';
        if (!items[0].description.trim()) errs.item_0 = 'At least one item is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReview = () => {
        if (validate()) setShowSummary(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await bookingAPI.create({
                trip_id: tripId,
                ...form,
                items: items.filter(i => i.description).map(i => ({
                    ...i, quantity: parseInt(i.quantity) || 1,
                    weight_estimate: i.weight_estimate ? parseFloat(i.weight_estimate) : null
                }))
            });
            Alert.alert('Success', 'Booking created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to create booking.');
        } finally { setLoading(false); }
    };

    const renderField = (key, label, placeholder, keyboard, multiline) => (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textarea, errors[key] && styles.inputError]}
                placeholder={placeholder}
                value={form[key]}
                onChangeText={v => update(key, v)}
                keyboardType={keyboard || 'default'}
                multiline={multiline}
                placeholderTextColor={colors.gray[400]}
            />
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
        </View>
    );

    // Confirmation Summary View
    if (showSummary) {
        const validItems = items.filter(i => i.description);
        return (
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.gray[50] }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.banner}>
                        <Text style={styles.bannerLabel}>REVIEW BOOKING</Text>
                        <Text style={styles.bannerText}>{directionLabel(direction)}</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.summaryHeading}>Please review your booking details before submitting.</Text>

                        {/* Sender Summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryCardHeader}>
                                <User size={14} color={colors.orange[500]} />
                                <Text style={styles.summaryCardTitle}>Sender</Text>
                            </View>
                            <Text style={styles.summaryName}>{form.sender_name}</Text>
                            <View style={styles.summaryRow}>
                                <Phone size={12} color={colors.gray[400]} />
                                <Text style={styles.summaryText}>{form.sender_phone}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <MapPin size={12} color={colors.gray[400]} />
                                <Text style={styles.summaryText}>{form.sender_address}</Text>
                            </View>
                        </View>

                        {/* Receiver Summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryCardHeader}>
                                <User size={14} color={colors.navy[500]} />
                                <Text style={styles.summaryCardTitle}>Receiver</Text>
                            </View>
                            <Text style={styles.summaryName}>{form.receiver_name}</Text>
                            <View style={styles.summaryRow}>
                                <Phone size={12} color={colors.gray[400]} />
                                <Text style={styles.summaryText}>{form.receiver_phone}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <MapPin size={12} color={colors.gray[400]} />
                                <Text style={styles.summaryText}>{form.receiver_address}</Text>
                            </View>
                        </View>

                        {/* Items Summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryCardHeader}>
                                <Package size={14} color={colors.orange[500]} />
                                <Text style={styles.summaryCardTitle}>Items ({validItems.length})</Text>
                            </View>
                            {validItems.map((item, i) => (
                                <View key={i} style={[styles.summaryItemRow, i === validItems.length - 1 && { borderBottomWidth: 0 }]}>
                                    <View style={styles.summaryItemNum}>
                                        <Text style={styles.summaryItemNumText}>{i + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.summaryItemDesc}>{item.description}</Text>
                                        <Text style={styles.summaryItemMeta}>
                                            Qty: {item.quantity || 1}{item.size_estimate ? ` • ${item.size_estimate}` : ''}{item.weight_estimate ? ` • ${item.weight_estimate}kg` : ''}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Instructions */}
                        {form.special_instructions ? (
                            <View style={styles.summaryCard}>
                                <View style={styles.summaryCardHeader}>
                                    <FileText size={14} color={colors.orange[500]} />
                                    <Text style={styles.summaryCardTitle}>Special Instructions</Text>
                                </View>
                                <Text style={styles.summaryText}>{form.special_instructions}</Text>
                            </View>
                        ) : null}

                        {/* Action Buttons */}
                        <TouchableOpacity style={styles.backBtn} onPress={() => setShowSummary(false)} activeOpacity={0.7}>
                            <ArrowLeft size={16} color={colors.gray[600]} />
                            <Text style={styles.backBtnText}>Edit Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                            {loading ? <ActivityIndicator color="white" /> : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                    <Send size={18} color={colors.white} />
                                    <Text style={styles.submitText}>Confirm & Submit</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.gray[50] }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Direction Banner */}
                <View style={styles.banner}>
                    <Text style={styles.bannerLabel}>ROUTE</Text>
                    <Text style={styles.bannerText}>{directionLabel(direction)}</Text>
                </View>

                <View style={styles.content}>
                    {/* Sender */}
                    <Text style={styles.sectionTitle}>Sender Details</Text>
                    {renderField('sender_name', 'Full Name', 'Sender full name')}
                    {renderField('sender_phone', 'Phone', '09171234567', 'phone-pad')}
                    {renderField('sender_address', 'Address', 'Complete pickup address', 'default', true)}

                    {/* Receiver */}
                    <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Receiver Details</Text>
                    {renderField('receiver_name', 'Full Name', 'Receiver full name')}
                    {renderField('receiver_phone', 'Phone', '09171234567', 'phone-pad')}
                    {renderField('receiver_address', 'Address', 'Complete delivery address', 'default', true)}

                    {/* Items */}
                    <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Items</Text>
                    {items.map((item, idx) => (
                        <View key={idx} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemBadge}>
                                    <Text style={styles.itemBadgeText}>Item {idx + 1}</Text>
                                </View>
                                {items.length > 1 && (
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(idx)} activeOpacity={0.6}>
                                        <Minus size={14} color={colors.danger[500]} />
                                        <Text style={styles.removeBtnText}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput style={[styles.input, errors[`item_${idx}`] && styles.inputError]} placeholder="Item description" value={item.description}
                                onChangeText={v => updateItem(idx, 'description', v)} placeholderTextColor={colors.gray[400]} />
                            {errors[`item_${idx}`] && <Text style={styles.errorText}>{errors[`item_${idx}`]}</Text>}
                            <View style={styles.row}>
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Qty" value={item.quantity}
                                    onChangeText={v => updateItem(idx, 'quantity', v)} keyboardType="numeric" placeholderTextColor={colors.gray[400]} />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Size (S/M/L)" value={item.size_estimate}
                                    onChangeText={v => updateItem(idx, 'size_estimate', v)} placeholderTextColor={colors.gray[400]} />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="kg" value={item.weight_estimate}
                                    onChangeText={v => updateItem(idx, 'weight_estimate', v)} keyboardType="numeric" placeholderTextColor={colors.gray[400]} />
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addBtn} onPress={addItem} activeOpacity={0.6}>
                        <Plus size={16} color={colors.orange[500]} />
                        <Text style={styles.addBtnText}>Add Another Item</Text>
                    </TouchableOpacity>

                    {/* Instructions */}
                    <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Special Instructions</Text>
                    <TextInput style={[styles.input, styles.textarea]} placeholder="Any notes or delivery instructions..."
                        value={form.special_instructions} onChangeText={v => update('special_instructions', v)}
                        multiline placeholderTextColor={colors.gray[400]} />

                    {/* Review Button */}
                    <TouchableOpacity style={styles.submitBtn} onPress={handleReview} activeOpacity={0.85}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                            <Text style={styles.submitText}>Review Booking</Text>
                            <ChevronRight size={18} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    banner: { backgroundColor: colors.navy[800], paddingVertical: spacing.base, paddingHorizontal: spacing.lg, alignItems: 'center' },
    bannerLabel: { ...typography.overline, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
    bannerText: { ...typography.h3, color: colors.white },
    content: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
    sectionTitle: { ...typography.h3, color: colors.gray[900], marginBottom: spacing.md },
    field: { marginBottom: spacing.md },
    label: { ...typography.label, color: colors.gray[600], marginBottom: spacing.sm },
    input: {
        backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray[200],
        borderRadius: radius.md, paddingHorizontal: spacing.base, height: 52,
        fontSize: 15, color: colors.gray[900], fontFamily: 'Inter_400Regular',
        ...shadows.sm,
    },
    inputError: { borderColor: colors.danger[400] },
    errorText: { ...typography.small, color: colors.danger[500], marginTop: 4, paddingLeft: 2 },
    textarea: { height: 100, textAlignVertical: 'top', paddingTop: spacing.md },
    itemCard: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.sm, gap: spacing.sm,
        ...shadows.card,
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemBadge: { backgroundColor: colors.navy[50], paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.sm },
    itemBadgeText: { ...typography.label, color: colors.navy[600] },
    removeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    removeBtnText: { ...typography.label, color: colors.danger[500] },
    row: { flexDirection: 'row', gap: spacing.sm },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        borderWidth: 1.5, borderColor: colors.orange[200], borderStyle: 'dashed',
        borderRadius: radius.md, paddingVertical: spacing.md, marginBottom: spacing.lg,
        backgroundColor: colors.orange[50],
    },
    addBtnText: { ...typography.bodySemiBold, color: colors.orange[500] },
    submitBtn: {
        backgroundColor: colors.orange[500], borderRadius: radius.lg,
        height: 56, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
        ...shadows.button,
    },
    submitText: { ...typography.button, color: colors.white },

    // Summary styles
    summaryHeading: { ...typography.body, color: colors.gray[500], marginBottom: spacing.lg, textAlign: 'center', lineHeight: 22 },
    summaryCard: {
        backgroundColor: colors.white, borderRadius: radius.lg,
        padding: spacing.base, marginBottom: spacing.md,
        ...shadows.card,
    },
    summaryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    summaryCardTitle: { ...typography.bodySemiBold, color: colors.gray[800], letterSpacing: -0.2 },
    summaryName: { ...typography.bodyMedium, color: colors.gray[900], marginBottom: spacing.xs },
    summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.xs },
    summaryText: { ...typography.caption, color: colors.gray[500], lineHeight: 20, flex: 1 },
    summaryItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[100], gap: spacing.md },
    summaryItemNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
    summaryItemNumText: { ...typography.small, color: colors.gray[600], fontWeight: '700' },
    summaryItemDesc: { ...typography.bodyMedium, color: colors.gray[800] },
    summaryItemMeta: { ...typography.small, color: colors.gray[400], marginTop: 2 },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        borderWidth: 1.5, borderColor: colors.gray[200],
        borderRadius: radius.md, height: 48, marginBottom: spacing.sm,
        backgroundColor: colors.white,
    },
    backBtnText: { ...typography.bodySemiBold, color: colors.gray[600] },
});
