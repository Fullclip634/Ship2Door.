import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, shadows, radius, spacing } from '../theme';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { Alert.alert('Error', 'Please fill in all fields.'); return; }
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password.');
        } finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoWrap}>
                        <View style={styles.logoBox}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.subtitle}>Door-to-door cargo delivery</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sign In</Text>
                        <Text style={styles.cardSubtitle}>Welcome back — enter your details</Text>

                        <View style={styles.field}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={18} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={colors.gray[400]}
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={18} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor={colors.gray[400]}
                                />
                                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} color={colors.gray[400]} /> : <Eye size={18} color={colors.gray[400]} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Sign In</Text>}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={styles.googleBtn} onPress={() => {/* Real Google Flow */ }} activeOpacity={0.7}>
                            <Image
                                source={{ uri: 'https://www.gstatic.com/images/branding/googleg/2x/googleg_standard_color_64dp.png' }}
                                style={styles.googleIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.googleBtnText}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.navy[800] },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
    logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
    logoBox: {
        width: 96,
        height: 96,
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: spacing.sm,
        ...shadows.lg,
    },
    logoImage: { width: '100%', height: '100%' },
    subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.45)', marginTop: spacing.xs },
    card: {
        backgroundColor: colors.white,
        borderRadius: radius['3xl'],
        padding: spacing['2xl'],
        ...shadows.xl,
    },
    cardTitle: { ...typography.h2, color: colors.gray[900], textAlign: 'center', marginBottom: spacing.xs },
    cardSubtitle: { ...typography.caption, color: colors.gray[400], textAlign: 'center', marginBottom: spacing['2xl'] },
    field: { marginBottom: spacing.lg },
    label: { ...typography.label, color: colors.gray[700], marginBottom: spacing.sm },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderWidth: 1.5,
        borderColor: colors.gray[200],
        borderRadius: radius.md,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: colors.gray[900], fontFamily: 'Inter_400Regular' },
    eyeBtn: { padding: spacing.xs },
    btn: {
        backgroundColor: colors.orange[500],
        borderRadius: radius.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        ...shadows.button,
    },
    btnText: { ...typography.button, color: colors.white },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
    dividerText: { ...typography.small, color: colors.gray[400], marginHorizontal: spacing.md, fontWeight: '600' },
    googleBtn: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.gray[200],
        borderRadius: radius.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    googleIcon: { width: 20, height: 20 },
    googleBtnText: {
        color: colors.gray[800],
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    linkWrap: { marginTop: spacing.xl, alignItems: 'center' },
    linkText: { ...typography.bodySemiBold, color: colors.gray[500] },
    linkBold: { color: colors.orange[500], fontWeight: '700' },
});
