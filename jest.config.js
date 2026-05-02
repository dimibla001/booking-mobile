module.exports = {
  preset: '@react-native/jest-preset',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!((@react-navigation|@react-native|react-native-screens|react-native-safe-area-context)/)?)',
  ],
};
