import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
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
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                address_manila: form.address_manila,
                address_bohol: form.address_bohol
            });
        } catch (err) {
            Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
    );

    const getIcon = (key) => {
        switch (key) {
            case 'name': return <User size={20} color={colors.gray[400]} />;
            case 'email': return <Mail size={20} color={colors.gray[400]} />;
            case 'phone': return <Phone size={20} color={colors.gray[400]} />;
            case 'password':
            case 'confirmPassword': return <Lock size={20} color={colors.gray[400]} />;
            case 'address_manila':
            case 'address_bohol': return <MapPin size={20} color={colors.gray[400]} />;
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
                            {step === 1 ? 'Personal Information' : 'Delivery Addresses'}
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
                                                        <EyeOff size={20} color={colors.gray[400]} /> :
                                                        <Eye size={20} color={colors.gray[400]} />
                                                    }
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.btn} onPress={handleNext}>
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
                                        <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                                            <View style={{ marginTop: 2 }}>{getIcon(f.key)}</View>
                                            <TextInput
                                                placeholder={f.placeholder}
                                                value={form[f.key]}
                                                onChangeText={(v) => update(f.key, v)}
                                                placeholderTextColor={colors.gray[400]}
                                                multiline={true}
                                                numberOfLines={3}
                                                textAlignVertical="top"
                                                style={[styles.input, { height: 80, marginLeft: 8 }]}
                                            />
                                        </View>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Complete Registration</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
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

                                <TouchableOpacity style={styles.googleBtn} onPress={() => {/* Real Google Flow */ }}>
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
    scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 24 },
    brand: { fontSize: 24, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '500' },
    stepContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
    stepDotActive: { backgroundColor: colors.orange[500] },
    stepLine: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
    stepLineActive: { backgroundColor: colors.orange[500] },
    card: { backgroundColor: colors.white, borderRadius: 24, padding: 24 },
    field: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: colors.gray[700], marginBottom: 6 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    iconBox: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
    eyeBtn: { padding: 4 },
    btn: { flexDirection: 'row', backgroundColor: colors.orange[500], borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 8 },
    btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
    backBtn: { flexDirection: 'row', marginTop: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
    backBtnText: { color: colors.gray[500], fontSize: 14, fontWeight: '600' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
    dividerText: { marginHorizontal: 10, fontSize: 12, color: colors.gray[400], fontWeight: '600' },
    googleBtn: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#747775',
        borderRadius: 12,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    googleIcon: { width: 20, height: 20 },
    googleBtnText: { color: '#1f1f1f', fontSize: 15, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' },
    linkWrap: { marginTop: 24, alignItems: 'center', paddingBottom: 20 },
    linkText: { fontSize: 14, color: colors.gray[500] },
    linkBold: { color: colors.orange[500], fontWeight: '600' },
});
