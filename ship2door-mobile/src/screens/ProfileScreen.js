import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { colors, typography, shadows, radius, spacing } from '../theme';
import { Edit3, LogOut, User, Phone, MapPin, Save } from 'lucide-react-native';

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

    const fieldIcons = {
        name: <User size={14} color={colors.gray[400]} />,
        phone: <Phone size={14} color={colors.gray[400]} />,
        address_manila: <MapPin size={14} color={colors.gray[400]} />,
        address_bohol: <MapPin size={14} color={colors.gray[400]} />,
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.content}>
                {/* Profile Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Profile Information</Text>
                        <TouchableOpacity
                            style={styles.editBtnWrap}
                            onPress={() => setEditing(!editing)} activeOpacity={0.6}
                        >
                            <Edit3 size={14} color={editing ? colors.gray[500] : colors.orange[500]} />
                            <Text style={[styles.editBtnText, editing && { color: colors.gray[500] }]}>
                                {editing ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {[
                        { key: 'name', label: 'Full Name' },
                        { key: 'phone', label: 'Phone Number', keyboard: 'phone-pad' },
                        { key: 'address_manila', label: 'Manila Address', multiline: true },
                        { key: 'address_bohol', label: 'Bohol Address', multiline: true },
                    ].map(f => (
                        <View key={f.key} style={styles.field}>
                            <View style={styles.fieldLabelRow}>
                                {fieldIcons[f.key]}
                                <Text style={styles.label}>{f.label}</Text>
                            </View>
                            {editing ? (
                                <TextInput
                                    style={[styles.input, f.multiline && styles.textarea]}
                                    value={form[f.key]}
                                    onChangeText={v => update(f.key, v)}
                                    keyboardType={f.keyboard || 'default'}
                                    multiline={f.multiline}
                                    placeholderTextColor={colors.gray[400]}
                                />
                            ) : (
                                <Text style={styles.value}>{user?.[f.key] || '—'}</Text>
                            )}
                        </View>
                    ))}

                    {editing && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                            {saving ? <ActivityIndicator color="white" /> : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                    <Save size={16} color={colors.white} />
                                    <Text style={styles.saveBtnText}>Save Changes</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.6}>
                    <LogOut size={18} color={colors.danger[500]} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.gray[50] },
    header: {
        backgroundColor: colors.navy[800],
        paddingTop: Platform.OS === 'ios' ? 72 : 52,
        paddingBottom: spacing['2xl'], alignItems: 'center',
    },
    avatarRing: {
        width: 88, height: 88, borderRadius: 28,
        borderWidth: 3, borderColor: 'rgba(245, 148, 30, 0.3)',
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: colors.orange[500], alignItems: 'center', justifyContent: 'center',
        ...shadows.lg,
    },
    avatarText: { color: colors.white, fontSize: 32, fontFamily: 'Inter_700Bold' },
    name: { ...typography.h2, color: colors.white },
    email: { ...typography.caption, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    content: { padding: spacing.lg },
    card: {
        backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing.lg,
        ...shadows.card,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    cardTitle: { ...typography.h3, color: colors.gray[900] },
    editBtnWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    editBtnText: { ...typography.bodySemiBold, color: colors.orange[500] },
    field: { marginBottom: spacing.base },
    fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    label: { ...typography.overline, color: colors.gray[400] },
    value: { ...typography.bodyMedium, color: colors.gray[800], paddingLeft: spacing.xl + 2 },
    input: {
        backgroundColor: colors.gray[50], borderWidth: 1.5, borderColor: colors.gray[200],
        borderRadius: radius.md, paddingHorizontal: spacing.base, height: 52,
        fontSize: 15, color: colors.gray[900], fontFamily: 'Inter_400Regular',
    },
    textarea: { height: 80, textAlignVertical: 'top', paddingTop: spacing.md },
    saveBtn: {
        backgroundColor: colors.orange[500], borderRadius: radius.md,
        height: 52, alignItems: 'center', justifyContent: 'center',
        marginTop: spacing.sm,
        ...shadows.button,
    },
    saveBtnText: { ...typography.button, color: colors.white },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        marginTop: spacing.xl, backgroundColor: colors.white,
        borderWidth: 1.5, borderColor: colors.danger[100],
        borderRadius: radius.md, height: 52,
        ...shadows.sm,
    },
    logoutText: { ...typography.button, color: colors.danger[500] },
});
