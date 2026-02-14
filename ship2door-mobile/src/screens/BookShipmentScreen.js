import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { bookingAPI } from '../services/api';
import { colors, directionLabel } from '../theme';

export default function BookShipmentScreen({ route, navigation }) {
    const { tripId, direction } = route.params;
    const [form, setForm] = useState({
        sender_name: '', sender_phone: '', sender_address: '',
        receiver_name: '', receiver_phone: '', receiver_address: '',
        special_instructions: '',
    });
    const [items, setItems] = useState([{ description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
    const updateItem = (idx, key, val) => {
        const copy = [...items];
        copy[idx][key] = val;
        setItems(copy);
    };
    const addItem = () => setItems([...items, { description: '', quantity: '1', size_estimate: '', weight_estimate: '' }]);
    const removeItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

    const handleSubmit = async () => {
        if (!form.sender_name || !form.sender_phone || !form.sender_address ||
            !form.receiver_name || !form.receiver_phone || !form.receiver_address) {
            Alert.alert('Error', 'Please fill in all sender and receiver details.');
            return;
        }
        if (!items[0].description) { Alert.alert('Error', 'Please add at least one item.'); return; }

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

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>{directionLabel(direction)}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Sender Details</Text>
                    {[
                        { key: 'sender_name', label: 'Name', placeholder: 'Sender full name' },
                        { key: 'sender_phone', label: 'Phone', placeholder: '09171234567', keyboard: 'phone-pad' },
                        { key: 'sender_address', label: 'Address', placeholder: 'Complete pickup address', multiline: true },
                    ].map(f => (
                        <View key={f.key} style={styles.field}>
                            <Text style={styles.label}>{f.label}</Text>
                            <TextInput style={[styles.input, f.multiline && styles.textarea]} placeholder={f.placeholder}
                                value={form[f.key]} onChangeText={v => update(f.key, v)}
                                keyboardType={f.keyboard || 'default'} multiline={f.multiline}
                                placeholderTextColor={colors.gray[400]} />
                        </View>
                    ))}

                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Receiver Details</Text>
                    {[
                        { key: 'receiver_name', label: 'Name', placeholder: 'Receiver full name' },
                        { key: 'receiver_phone', label: 'Phone', placeholder: '09171234567', keyboard: 'phone-pad' },
                        { key: 'receiver_address', label: 'Address', placeholder: 'Complete delivery address', multiline: true },
                    ].map(f => (
                        <View key={f.key} style={styles.field}>
                            <Text style={styles.label}>{f.label}</Text>
                            <TextInput style={[styles.input, f.multiline && styles.textarea]} placeholder={f.placeholder}
                                value={form[f.key]} onChangeText={v => update(f.key, v)}
                                keyboardType={f.keyboard || 'default'} multiline={f.multiline}
                                placeholderTextColor={colors.gray[400]} />
                        </View>
                    ))}

                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Items</Text>
                    {items.map((item, idx) => (
                        <View key={idx} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemLabel}>Item {idx + 1}</Text>
                                {items.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(idx)}>
                                        <Text style={{ color: colors.danger[500], fontSize: 13, fontWeight: '600' }}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput style={styles.input} placeholder="Item description" value={item.description}
                                onChangeText={v => updateItem(idx, 'description', v)} placeholderTextColor={colors.gray[400]} />
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
                    <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                        <Text style={styles.addBtnText}>+ Add Another Item</Text>
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Special Instructions</Text>
                    <TextInput style={[styles.input, styles.textarea]} placeholder="Any notes or delivery instructions..."
                        value={form.special_instructions} onChangeText={v => update('special_instructions', v)}
                        multiline placeholderTextColor={colors.gray[400]} />

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Submit Booking</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    banner: { backgroundColor: colors.navy[800], paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
    bannerText: { color: colors.white, fontSize: 15, fontWeight: '600' },
    content: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 14, letterSpacing: -0.3 },
    field: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginBottom: 6 },
    input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
    textarea: { height: 90, textAlignVertical: 'top' },
    itemCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.gray[200], gap: 10 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemLabel: { fontSize: 13, fontWeight: '600', color: colors.navy[600] },
    row: { flexDirection: 'row', gap: 8 },
    addBtn: { borderWidth: 1.5, borderColor: colors.orange[300], borderStyle: 'dashed', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
    addBtnText: { color: colors.orange[500], fontSize: 14, fontWeight: '600' },
    submitBtn: { backgroundColor: colors.orange[500], borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    submitText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
