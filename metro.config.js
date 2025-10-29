// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');
config.transformer={
    getTransformOptions: async () => ({
        transform: {
            inlineRequires: {
                blockList: {
                    [require.resolve('@powersync/react-native')]: true
                }
            }
        }
    })
}
module.exports = config;
