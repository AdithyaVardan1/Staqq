import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async () => {
        if (!email.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);
        const result = await signUp(email.trim(), password);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <SafeAreaView className="flex-1 bg-bg-dark items-center justify-center px-6">
                <CheckCircle size={48} color="#22C55E" />
                <Text className="text-white text-xl font-semibold mt-4 text-center">
                    Check your email
                </Text>
                <Text className="text-zinc-400 text-sm text-center mt-2">
                    We sent a verification link to {email}. Click it to activate your account.
                </Text>
                <TouchableOpacity
                    onPress={() => router.replace('/auth/login')}
                    className="bg-brand rounded-xl py-3 px-8 mt-6"
                    activeOpacity={0.8}
                >
                    <Text className="text-black font-semibold">Go to Sign In</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Close */}
                <View className="flex-row justify-end px-4 pt-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <X size={24} color="#71717A" />
                    </TouchableOpacity>
                </View>

                {/* Header */}
                <View className="items-center mt-6 mb-8">
                    <Text className="text-brand text-3xl font-bold">Staqq</Text>
                    <Text className="text-white text-xl font-semibold mt-4">Create account</Text>
                    <Text className="text-zinc-500 text-sm mt-1">Start tracking Indian markets</Text>
                </View>

                {/* Form */}
                <View className="px-6">
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#52525B"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="bg-zinc-900 border border-white/10 rounded-xl px-4 h-12 text-white mb-3"
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#52525B"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        className="bg-zinc-900 border border-white/10 rounded-xl px-4 h-12 text-white mb-3"
                    />

                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#52525B"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        className="bg-zinc-900 border border-white/10 rounded-xl px-4 h-12 text-white mb-4"
                    />

                    {error ? (
                        <Text className="text-danger text-xs mb-3">{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        onPress={handleSignUp}
                        className="bg-brand rounded-xl h-12 items-center justify-center"
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text className="text-black font-semibold text-base">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-5">
                        <Text className="text-zinc-500 text-sm">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                            <Text className="text-brand text-sm font-semibold">Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
