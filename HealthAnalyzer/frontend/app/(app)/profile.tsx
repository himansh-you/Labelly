import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Profile Avatar Component with enhanced animation
const ProfileAvatar = ({ name, photoURL }: { name: string; photoURL?: string }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    rotation.value = withTiming(5, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });

    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      rotation.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }, 100);
  };

  return (
    <AnimatedTouchableOpacity onPress={handlePress} style={animatedStyle}>
      <Stack
        width={100}
        height={100}
        backgroundColor="#363636"
        borderRadius={50}
        alignItems="center"
        justifyContent="center"
        borderWidth={4}
        borderColor="white"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.2}
        shadowRadius={8}
        elevation={8}
      >
        {photoURL ? (
          <Animated.Image
            source={{ uri: photoURL }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 45,
            }}
          />
        ) : (
          <Text
            fontSize={32}
            fontWeight="600"
            color="white"
            fontFamily="Baloo2Bold"
          >
            {initials}
          </Text>
        )}
      </Stack>
    </AnimatedTouchableOpacity>
  );
};

// Enhanced Menu Item Component with improved animations
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true 
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
  };

  const handlePressOut = () => {
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
  };

  const handlePress = () => {
    // Add a subtle bounce effect on press
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
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
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

          {showArrow && (
            <Animated.View style={arrowAnimatedStyle}>
              <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
            </Animated.View>
          )}
        </Stack>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

// Enhanced Animated Button Component matching scan page design
interface AnimatedButtonProps {
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  children: React.ReactNode;
  borderColor?: string;
  isDestructive?: boolean;
  variant?: 'primary' | 'secondary';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  onPress, 
  backgroundColor, 
  textColor, 
  children, 
  borderColor,
  isDestructive = false,
  variant = 'primary'
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: shadowOpacity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 20,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 150 });
    shadowOpacity.value = withTiming(isDestructive ? 0.25 : 0.05, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
  };

  const handlePress = () => {
    // Add a satisfying tap effect
    scale.value = withSpring(0.92, {
      damping: 25,
      stiffness: 500,
    });
    
    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
      runOnJS(onPress)();
    }, 75);
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: borderColor ? 2 : 0,
          borderColor: borderColor || 'transparent',
          shadowColor: isDestructive ? "#FF3B30" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          minHeight: 56,
        },
        animatedStyle,
        shadowStyle,
      ]}
      activeOpacity={1}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Force a re-render to get the latest user data
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Get user display name or email
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    console.log('Edit Profile pressed');
    router.push('/(app)/edit-profile');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
    router.push('/(app)/settings');
  };

  const handleNotifications = () => {
    console.log('Notifications pressed');
    // TODO: Navigate to notifications screen
  };

  const handleHelpSupport = () => {
    console.log('Help & Support pressed');
    // TODO: Navigate to help & support screen
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy pressed');
    // TODO: Navigate to privacy policy screen
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
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
                    Back
                  </Text>
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Profile Section */}
            <Stack alignItems="center" marginBottom="$8" key={refreshKey}>
              <ProfileAvatar 
                name={getUserDisplayName()} 
                photoURL={user?.photoURL}
              />
              <Text
                fontSize={24}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2Bold"
                marginTop="$4"
                marginBottom="$2"
              >
                {getUserDisplayName()}
              </Text>
              <Text
                fontSize={16}
                color="#666"
                fontFamily="Baloo2Regular"
                marginBottom="$6"
              >
                {user?.email}
              </Text>

              {/* Edit Profile Button */}
              <AnimatedButton
                onPress={handleEditProfile}
                backgroundColor="white"
                textColor="#363636"
                borderColor="#E0E0E0"
                variant="secondary"
              >
                <Stack flexDirection="row" alignItems="center" space="$3">
                  <Feather name="edit-2" size={18} color="#363636" />
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="#363636"
                    fontFamily="Baloo2SemiBold"
                  >
                    Edit Profile
                  </Text>
                </Stack>
              </AnimatedButton>
            </Stack>

            {/* Menu Items */}
            <Stack flex={1} marginBottom="$6">
              <MenuItem
                icon={<Ionicons name="settings-outline" size={24} color="#363636" />}
                title="Settings"
                subtitle="App preferences and configurations"
                onPress={handleSettings}
              />

              <MenuItem
                icon={<Ionicons name="notifications-outline" size={24} color="#363636" />}
                title="Notifications"
                subtitle="Manage your notification preferences"
                onPress={handleNotifications}
              />

              <MenuItem
                icon={<Ionicons name="help-circle-outline" size={24} color="#363636" />}
                title="Help & Support"
                subtitle="Get help and contact support"
                onPress={handleHelpSupport}
              />

              <MenuItem
                icon={<Ionicons name="shield-outline" size={24} color="#363636" />}
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={handlePrivacyPolicy}
              />
            </Stack>

            {/* Logout Button */}
            <AnimatedButton
              onPress={handleLogout}
              backgroundColor="#FF3B30"
              textColor="white"
              isDestructive={true}
              variant="primary"
            >
              <Stack flexDirection="row" alignItems="center" space="$3">
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color="white"
                  fontFamily="Baloo2SemiBold"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </Stack>
            </AnimatedButton>
          </Stack>
        </ScrollView>
      </Stack>
    </>
  );
} 