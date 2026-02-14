import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, shadows, radius, spacing } from '../theme';
import { User, Mail, Phone, Lock, MapPin, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
    const { register, googleLogin } = useAuth();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        address_manila: '', address_bohol: ''
    });
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleNext = () => {
        if (step === 1) {
            if (!form.name || !form.email || !form.password || !form.confirmPassword) {
                Alert.alert('Error', 'Please fill in all required fields.');
                return;
            }
            if (form.password !== form.confirmPassword) {
                Alert.alert('Error', 'Passwords do not match.');
                return;
            }
            if (form.password.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters.');
                return;
            }
            setStep(2);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            await register({
                name: form.name, email: form.email, phone: form.phone,
                password: form.password, address_manila: form.address_manila,
                address_bohol: form.address_bohol
            });
        } catch (err) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong.');
        } finally { setLoading(false); }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
            </View>
        </View>
    );

    const getIcon = (key) => {
        const c = colors.gray[400];
        switch (key) {
            case 'name': return <User size={18} color={c} />;
            case 'email': return <Mail size={18} color={c} />;
            case 'phone': return <Phone size={18} color={c} />;
            case 'password':
            case 'confirmPassword': return <Lock size={18} color={c} />;
            case 'address_manila':
            case 'address_bohol': return <MapPin size={18} color={c} />;
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.brand}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 ? 'Step 1 — Personal Information' : 'Step 2 — Delivery Addresses'}
                        </Text>
                        {renderStepIndicator()}
                    </View>

                    <View style={styles.card}>
                        {step === 1 ? (
                            <View>
                                {[
                                    { key: 'name', label: 'Full Name', placeholder: 'Juan Dela Cruz' },
                                    { key: 'email', label: 'Email', placeholder: 'your@email.com', keyboard: 'email-address' },
                                    { key: 'phone', label: 'Phone Number', placeholder: '09171234567', keyboard: 'phone-pad' },
                                    { key: 'password', label: 'Password', placeholder: 'At least 6 characters', secure: true },
                                    { key: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat password', secure: true },
                                ].map(f => (
                                    <View key={f.key} style={styles.field}>
                                        <Text style={styles.label}>{f.label}</Text>
                                        <View style={styles.inputContainer}>
                                            <View style={styles.iconBox}>{getIcon(f.key)}</View>
                                            <TextInput
                                                placeholder={f.placeholder}
                                                value={form[f.key]}
                                                onChangeText={(v) => update(f.key, v)}
                                                keyboardType={f.keyboard || 'default'}
                                                secureTextEntry={f.secure ? (f.key === 'password' ? !showPassword : !showConfirmPassword) : false}
                                                autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                                                placeholderTextColor={colors.gray[400]}
                                                style={styles.input}
                                            />
                                            {f.secure && (
                                                <TouchableOpacity
                                                    style={styles.eyeBtn}
                                                    onPress={() => f.key === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {(f.key === 'password' ? showPassword : showConfirmPassword) ?
                                                        <EyeOff size={18} color={colors.gray[400]} /> :
                                                        <Eye size={18} color={colors.gray[400]} />
                                                    }
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
                                    <Text style={styles.btnText}>Continue</Text>
                                    <ChevronRight size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {[
                                    { key: 'address_manila', label: 'Manila Address (optional)', placeholder: 'Your Manila address' },
                                    { key: 'address_bohol', label: 'Bohol Address (optional)', placeholder: 'Your Bohol address' },
                                ].map(f => (
                                    <View key={f.key} style={styles.field}>
                                        <Text style={styles.label}>{f.label}</Text>
                                        <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 14, height: 100 }]}>
                                            <View style={{ marginTop: 2 }}>{getIcon(f.key)}</View>
                                            <TextInput
                                                placeholder={f.placeholder}
                                                value={form[f.key]}
                                                onChangeText={(v) => update(f.key, v)}
                                                placeholderTextColor={colors.gray[400]}
                                                multiline={true}
                                                numberOfLines={3}
                                                textAlignVertical="top"
                                                style={[styles.input, { height: 70, marginLeft: 10 }]}
                                            />
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Complete Registration</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} activeOpacity={0.6}>
                                    <ChevronLeft size={20} color={colors.gray[500]} />
                                    <Text style={styles.backBtnText}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 1 && (
                            <>
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity style={styles.googleBtn} onPress={() => {/* Real Google Flow */ }} activeOpacity={0.7}>
                                    <Image
                                        source={{ uri: 'https://www.gstatic.com/images/branding/googleg/2x/googleg_standard_color_64dp.png' }}
                                        style={styles.googleIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.googleBtnText}>Sign up with Google</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.goBack()}>
                            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.navy[800] },
    scroll: { flexGrow: 1, padding: spacing.xl, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    brand: { ...typography.h1, color: colors.white },
    subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: spacing.xs },
    stepContainer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
    stepDot: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: colors.orange[500] },
    stepNum: { ...typography.small, color: 'rgba(255,255,255,0.4)' },
    stepNumActive: { color: colors.white, fontWeight: '700' },
    stepLine: { width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.sm, borderRadius: 2 },
    stepLineActive: { backgroundColor: colors.orange[500] },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius['3xl'],
        padding: spacing.xl,
        ...shadows.xl,
    },
    field: { marginBottom: spacing.base },
    label: { ...typography.label, color: colors.gray[700], marginBottom: spacing.sm },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.gray[50], borderWidth: 1.5, borderColor: colors.gray[200],
        borderRadius: radius.md, paddingHorizontal: 14, height: 52,
    },
    iconBox: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: colors.gray[900], fontFamily: 'Inter_400Regular' },
    eyeBtn: { padding: spacing.xs },
    btn: {
        flexDirection: 'row', backgroundColor: colors.orange[500], borderRadius: radius.md,
        height: 52, alignItems: 'center', justifyContent: 'center',
        marginTop: spacing.sm, gap: spacing.sm,
        ...shadows.button,
    },
    btnText: { ...typography.button, color: colors.white },
    backBtn: { flexDirection: 'row', marginTop: spacing.md, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
    backBtnText: { ...typography.bodySemiBold, color: colors.gray[500] },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
    dividerText: { ...typography.small, color: colors.gray[400], marginHorizontal: spacing.md, fontWeight: '600' },
    googleBtn: {
        flexDirection: 'row', backgroundColor: colors.white,
        borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: radius.md,
        height: 52, alignItems: 'center', justifyContent: 'center', gap: spacing.md,
    },
    googleIcon: { width: 20, height: 20 },
    googleBtnText: { color: colors.gray[800], fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    linkWrap: { marginTop: spacing.xl, alignItems: 'center', paddingBottom: spacing.lg },
    linkText: { ...typography.bodySemiBold, color: colors.gray[500] },
    linkBold: { color: colors.orange[500], fontWeight: '700' },
});
