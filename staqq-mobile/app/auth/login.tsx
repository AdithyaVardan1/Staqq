import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        const result = await signIn(email.trim(), password);
        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            router.back();
        }
    };

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
                    <Text className="text-white text-xl font-semibold mt-4">Welcome back</Text>
                    <Text className="text-zinc-500 text-sm mt-1">Sign in to your account</Text>
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
                        className="bg-zinc-900 border border-white/10 rounded-xl px-4 h-12 text-white mb-4"
                    />

                    {error ? (
                        <Text className="text-danger text-xs mb-3">{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        onPress={handleSignIn}
                        className="bg-brand rounded-xl h-12 items-center justify-center"
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text className="text-black font-semibold text-base">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-5">
                        <Text className="text-zinc-500 text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
                            <Text className="text-brand text-sm font-semibold">Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
