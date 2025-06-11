module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin requis pour react-native-reanimated
      'react-native-reanimated/plugin',
    ]
  };
}; 