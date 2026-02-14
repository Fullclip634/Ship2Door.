import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
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
                <ScrollView contentContainerStyle={styles.scroll}>
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

                        <View style={styles.field}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="your@email.com" value={email}
                                    onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                                    placeholderTextColor={colors.gray[400]} />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Enter password" value={password}
                                    onChangeText={setPassword} secureTextEntry={!showPassword}
                                    placeholderTextColor={colors.gray[400]} />
                                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} color={colors.gray[400]} /> : <Eye size={20} color={colors.gray[400]} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Sign In</Text>}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity style={styles.googleBtn} onPress={() => {/* Real Google Flow */ }}>
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
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoWrap: { alignItems: 'center', marginBottom: 20 },
    logoBox: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 8,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '500' },
    card: { backgroundColor: colors.white, borderRadius: 24, padding: 28 },
    cardTitle: { fontSize: 22, fontWeight: '700', color: colors.gray[900], marginBottom: 28, textAlign: 'center', letterSpacing: -0.5 },
    field: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: colors.gray[700], marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.gray[900] },
    eyeBtn: { padding: 4 },
    btn: { backgroundColor: colors.orange[500], borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
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
    linkWrap: { marginTop: 24, alignItems: 'center' },
    linkText: { fontSize: 14, color: colors.gray[500] },
    linkBold: { color: colors.orange[500], fontWeight: '600' },
});
