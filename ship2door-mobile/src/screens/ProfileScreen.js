import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { colors } from '../theme';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '', phone: user?.phone || '',
        address_manila: user?.address_manila || '', address_bohol: user?.address_bohol || ''
    });
    const [saving, setSaving] = useState(false);

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(form);
            updateUser(res.data.data);
            setEditing(false);
            Alert.alert('Success', 'Profile updated!');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update.');
        } finally { setSaving(false); }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Profile Information</Text>
                        <TouchableOpacity onPress={() => setEditing(!editing)}>
                            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {[
                        { key: 'name', label: 'Full Name' },
                        { key: 'phone', label: 'Phone Number', keyboard: 'phone-pad' },
                        { key: 'address_manila', label: 'Manila Address', multiline: true },
                        { key: 'address_bohol', label: 'Bohol Address', multiline: true },
                    ].map(f => (
                        <View key={f.key} style={styles.field}>
                            <Text style={styles.label}>{f.label}</Text>
                            {editing ? (
                                <TextInput style={[styles.input, f.multiline && styles.textarea]} value={form[f.key]}
                                    onChangeText={v => update(f.key, v)} keyboardType={f.keyboard || 'default'}
                                    multiline={f.multiline} placeholderTextColor={colors.gray[400]} />
                            ) : (
                                <Text style={styles.value}>{user?.[f.key] || '-'}</Text>
                            )}
                        </View>
                    ))}

                    {editing && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    header: { backgroundColor: colors.navy[800], paddingTop: 70, paddingBottom: 32, alignItems: 'center' },
    avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.orange[500], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { color: colors.white, fontSize: 28, fontWeight: '700' },
    name: { fontSize: 20, fontWeight: '700', color: colors.white, letterSpacing: -0.3 },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    content: { padding: 20 },
    card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.gray[200] },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], letterSpacing: -0.3 },
    editBtn: { fontSize: 14, fontWeight: '600', color: colors.orange[500] },
    field: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '600', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    value: { fontSize: 15, color: colors.gray[800], fontWeight: '500' },
    input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
    textarea: { height: 80, textAlignVertical: 'top' },
    saveBtn: { backgroundColor: colors.orange[500], borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
    logoutBtn: { marginTop: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.danger[500], borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
    logoutText: { color: colors.danger[500], fontSize: 15, fontWeight: '600' },
});
