// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Alias react-native-linear-gradient to expo-linear-gradient for web compatibility
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
        moduleName === 'react-native-linear-gradient' &&
        platform === 'web'
    ) {
        return context.resolveRequest(context, 'expo-linear-gradient', platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
