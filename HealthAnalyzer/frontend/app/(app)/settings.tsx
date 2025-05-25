import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { 
  Ionicons, 
  MaterialIcons,
  Feather
} from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Easing
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Settings Item Component with toggle switch
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  disabled?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  disabled = false
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);
  const iconScale = useSharedValue(1);
  const arrowTranslateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value }
    ],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: interpolate(shadowOpacity.value, [0.1, 0.25], [3, 8]),
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslateX.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.96, {
        damping: 20,
        stiffness: 400,
      });
      opacity.value = withTiming(0.85, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      translateX.value = withTiming(2, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      shadowOpacity.value = withTiming(0.25, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      iconScale.value = withSpring(1.1, {
        damping: 15,
        stiffness: 300,
      });
      if (showArrow) {
        arrowTranslateX.value = withTiming(3, {
          duration: 150,
          easing: Easing.out(Easing.quad),
        });
      }
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      translateX.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      shadowOpacity.value = withTiming(0.1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      iconScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      if (showArrow) {
        arrowTranslateX.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.98, {
        damping: 25,
        stiffness: 500,
      });
      
      setTimeout(() => {
        scale.value = withSpring(1, {
          damping: 20,
          stiffness: 400,
        });
        runOnJS(onPress)();
      }, 50);
    }
  };

  return (
    <AnimatedTouchableOpacity
      onPress={onPress ? handlePress : undefined}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={animatedStyle}
      disabled={disabled || !onPress}
    >
      <Animated.View style={shadowStyle}>
        <Stack
          backgroundColor="white"
          borderRadius={16}
          padding="$4"
          marginBottom="$3"
          flexDirection="row"
          alignItems="center"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowRadius={4}
          opacity={disabled ? 0.6 : 1}
        >
          <Animated.View style={iconAnimatedStyle}>
            <Stack
              width={48}
              height={48}
              backgroundColor="#F5F5F5"
              borderRadius={12}
              alignItems="center"
              justifyContent="center"
              marginRight="$4"
            >
              {icon}
            </Stack>
          </Animated.View>
          
          <Stack flex={1}>
            <Text
              fontSize={16}
              fontWeight="600"
              color="#363636"
              fontFamily="Baloo2SemiBold"
              marginBottom={subtitle ? "$1" : 0}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                fontSize={14}
                color="#666"
                fontFamily="Baloo2Regular"
              >
                {subtitle}
              </Text>
            )}
          </Stack>

          {showToggle && (
            <Switch
              value={toggleValue}
              onValueChange={onToggleChange}
              trackColor={{ false: '#E0E0E0', true: '#363636' }}
              thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E0E0E0"
              style={{ marginRight: 8 }}
            />
          )}

          {showArrow && !showToggle && (
            <Animated.View style={arrowAnimatedStyle}>
              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </Animated.View>
          )}
        </Stack>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

// Language Selection Component
const LanguageSelector: React.FC<{
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}> = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const handleLanguageSelect = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        ...languages.map(lang => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: () => onLanguageChange(lang.code),
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getCurrentLanguageName = () => {
    const current = languages.find(lang => lang.code === selectedLanguage);
    return current ? `${current.flag} ${current.name}` : '🇺🇸 English';
  };

  return (
    <SettingsItem
      icon={<Ionicons name="language-outline" size={24} color="#363636" />}
      title="Language"
      subtitle={getCurrentLanguageName()}
      onPress={handleLanguageSelect}
    />
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will receive an email with instructions to reset your password.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Email',
          onPress: () => {
            // TODO: Implement password reset email
            Alert.alert('Success', 'Password reset email sent!');
          },
        },
      ]
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Implement notification settings persistence
    console.log('Notifications:', value ? 'enabled' : 'disabled');
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    // TODO: Implement dark mode functionality
    console.log('Dark mode:', value ? 'enabled' : 'disabled');
    Alert.alert(
      'Dark Mode',
      value ? 'Dark mode will be available in a future update!' : 'Switched back to light mode',
      [{ text: 'OK' }]
    );
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // TODO: Implement language change functionality
    console.log('Language changed to:', languageCode);
    Alert.alert(
      'Language Changed',
      'Language settings will be applied in a future update!',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="#FDFAF6">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Stack flex={1} paddingHorizontal="$6" paddingTop="$12" paddingBottom="$6">
            {/* Header */}
            <Stack flexDirection="row" alignItems="center" marginBottom="$8">
              <TouchableOpacity onPress={handleBack}>
                <Stack 
                  flexDirection="row" 
                  alignItems="center" 
                  space="$2"
                  paddingVertical="$2"
                >
                  <Ionicons name="arrow-back" size={24} color="#363636" />
                  <Text 
                    fontSize={18} 
                    fontFamily="Baloo2SemiBold" 
                    color="#363636"
                  >
                    Settings
                  </Text>
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Settings Sections */}
            <Stack flex={1}>
              {/* App Preferences Section */}
              <Text
                fontSize={20}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2Bold"
                marginBottom="$4"
                marginLeft="$2"
              >
                App Preferences
              </Text>

              <SettingsItem
                icon={<Ionicons name="notifications-outline" size={24} color="#363636" />}
                title="Notifications"
                subtitle={notificationsEnabled ? 'Enabled' : 'Disabled'}
                showToggle={true}
                toggleValue={notificationsEnabled}
                onToggleChange={handleNotificationToggle}
                showArrow={false}
              />

              <SettingsItem
                icon={<Ionicons name="moon-outline" size={24} color="#363636" />}
                title="Dark Mode"
                subtitle={darkModeEnabled ? 'Enabled' : 'Disabled'}
                showToggle={true}
                toggleValue={darkModeEnabled}
                onToggleChange={handleDarkModeToggle}
                showArrow={false}
              />

              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />

              {/* Account Section */}
              <Text
                fontSize={20}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2Bold"
                marginTop="$6"
                marginBottom="$4"
                marginLeft="$2"
              >
                Account
              </Text>

              <SettingsItem
                icon={<Ionicons name="lock-closed-outline" size={24} color="#363636" />}
                title="Change Password"
                subtitle="Update your account password"
                onPress={handleChangePassword}
              />

              {/* App Info Section */}
              <Text
                fontSize={20}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2Bold"
                marginTop="$6"
                marginBottom="$4"
                marginLeft="$2"
              >
                About
              </Text>

              <SettingsItem
                icon={<Ionicons name="information-circle-outline" size={24} color="#363636" />}
                title="App Version"
                subtitle="1.0.0 (Beta)"
                showArrow={false}
                disabled={true}
              />

              <SettingsItem
                icon={<Ionicons name="code-outline" size={24} color="#363636" />}
                title="Build Info"
                subtitle="React Native • Expo • Firebase"
                showArrow={false}
                disabled={true}
              />
            </Stack>
          </Stack>
        </ScrollView>
      </Stack>
    </>
  );
} 