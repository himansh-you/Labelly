import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { 
  Ionicons, 
  Feather,
  MaterialIcons
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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

// Enhanced Profile Avatar Component with edit functionality - matching design language
const EditableProfileAvatar = ({ 
  name, 
  imageUri, 
  onImageSelect 
}: { 
  name: string; 
  imageUri?: string | null;
  onImageSelect: (uri: string) => void;
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

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

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handlePress = async () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    rotation.value = withTiming(5, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    overlayOpacity.value = withTiming(0.3, {
      duration: 100,
    });

    setTimeout(async () => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      rotation.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      overlayOpacity.value = withTiming(0, {
        duration: 200,
      });

      // Show image picker options
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Gallery',
            onPress: () => openGallery(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }, 100);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelect(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelect(result.assets[0].uri);
    }
  };

  return (
    <AnimatedTouchableOpacity onPress={handlePress} style={animatedStyle}>
      <Stack
        width={120}
        height={120}
        backgroundColor="#363636"
        borderRadius={60}
        alignItems="center"
        justifyContent="center"
        borderWidth={4}
        borderColor="white"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.2}
        shadowRadius={8}
        elevation={8}
        position="relative"
        overflow="hidden"
      >
        {imageUri ? (
          <Animated.Image
            source={{ uri: imageUri }}
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text
            fontSize={36}
            fontWeight="600"
            color="white"
            fontFamily="Baloo2Bold"
          >
            {initials}
          </Text>
        )}
        
        {/* Edit Overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 56,
              alignItems: 'center',
              justifyContent: 'center',
            },
            overlayStyle,
          ]}
        >
          <Ionicons name="camera" size={24} color="white" />
        </Animated.View>

        {/* Edit Icon - matching the design language */}
        <Stack
          position="absolute"
          bottom={-2}
          right={-2}
          width={36}
          height={36}
          backgroundColor="#363636"
          borderRadius={18}
          alignItems="center"
          justifyContent="center"
          borderWidth={3}
          borderColor="white"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={4}
          elevation={4}
        >
          <Feather name="edit-2" size={16} color="white" />
        </Stack>
      </Stack>
    </AnimatedTouchableOpacity>
  );
};

// Input Field Component - matching the edit profile button border style
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  editable?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: interpolate(shadowOpacity.value, [0.1, 0.2], [3, 6]),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
    shadowOpacity.value = withTiming(0.2, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    shadowOpacity.value = withTiming(0.1, { duration: 200 });
  };

  return (
    <AnimatedTouchableOpacity style={animatedStyle} disabled>
      <Animated.View style={shadowStyle}>
        <Stack
          backgroundColor="white"
          borderRadius={16}
          padding="$4"
          marginBottom="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowRadius={4}
          borderWidth={2}
          borderColor="#E0E0E0"
        >
          {/* Icon and Label Row */}
          <Stack flexDirection="row" alignItems="center" marginBottom="$2">
            {icon && (
              <Stack
                width={24}
                height={24}
                alignItems="center"
                justifyContent="center"
                marginRight="$2"
              >
                {icon}
              </Stack>
            )}
            <Text
              fontSize={14}
              fontWeight="600"
              color="#363636"
              fontFamily="Baloo2SemiBold"
            >
              {label}
            </Text>
          </Stack>
          
          {/* Input Field */}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
            style={{
              fontSize: 16,
              fontFamily: 'Baloo2Regular',
              color: editable ? '#363636' : '#999',
              paddingVertical: 4,
              minHeight: 24,
            }}
          />
        </Stack>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

// Info Card Component - matching the design language
const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Stack 
      backgroundColor="white" 
      borderRadius={16} 
      padding="$4" 
      marginTop="$2"
      marginBottom="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      borderWidth={1}
      borderColor="#FFF3CD"
    >
      {children}
    </Stack>
  );
};

// Enhanced Save Button Component - matching the design language
const SaveButton: React.FC<{
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
}> = ({ onPress, isLoading, disabled }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: interpolate(shadowOpacity.value, [0.1, 0.3], [3, 8]),
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 400,
      });
      opacity.value = withTiming(0.9, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
      shadowOpacity.value = withTiming(0.3, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(1, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      shadowOpacity.value = withTiming(0.1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    }
  };

  const handlePress = () => {
    if (!disabled) {
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
    }
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
    >
      <Animated.View style={shadowStyle}>
        <Stack
          backgroundColor={disabled ? '#B0B0B0' : '#363636'}
          borderRadius={16}
          paddingVertical="$4"
          paddingHorizontal="$6"
          alignItems="center"
          justifyContent="center"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowRadius={4}
        >
          <Stack flexDirection="row" alignItems="center" space="$2">
            {isLoading ? (
              <Ionicons name="refresh" size={20} color="white" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="white" />
            )}
            <Text
              fontSize={16}
              fontWeight="600"
              color="white"
              fontFamily="Baloo2SemiBold"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Stack>
        </Stack>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setProfileImageUri(user.photoURL || null);
    }
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleImageSelect = (uri: string) => {
    setProfileImageUri(uri);
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    try {
      setIsLoading(true);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Create the display name
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName,
        photoURL: profileImageUri, // In a real app, you'd upload to Firebase Storage first
      });

      console.log('Profile updated successfully:', {
        displayName,
        photoURL: profileImageUri,
      });

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.email?.split('@')[0] || 'User';
  };

  const hasChanges = () => {
    const currentDisplayName = user?.displayName || '';
    const currentNameParts = currentDisplayName.split(' ');
    const currentFirstName = currentNameParts[0] || '';
    const currentLastName = currentNameParts.slice(1).join(' ') || '';
    
    return (
      firstName !== currentFirstName ||
      lastName !== currentLastName ||
      profileImageUri !== (user?.photoURL || null)
    );
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack flex={1} backgroundColor="#FDFAF6">
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Stack flex={1} paddingHorizontal="$6" paddingTop="$12" paddingBottom="$6">
              {/* Header - matching other screens */}
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
                      Edit Profile
                    </Text>
                  </Stack>
                </TouchableOpacity>
              </Stack>

              {/* Profile Avatar Section - matching design */}
              <Stack alignItems="center" marginBottom="$8">
                <EditableProfileAvatar
                  name={getDisplayName()}
                  imageUri={profileImageUri}
                  onImageSelect={handleImageSelect}
                />
                <Text
                  fontSize={16}
                  color="#666"
                  fontFamily="Baloo2Regular"
                  marginTop="$4"
                  textAlign="center"
                >
                  Tap to change profile picture
                </Text>
              </Stack>

              {/* Form Fields - matching card design */}
              <Stack flex={1} marginBottom="$6">
                <InputField
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  autoCapitalize="words"
                  icon={<Ionicons name="person-outline" size={20} color="#363636" />}
                />

                <InputField
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  autoCapitalize="words"
                  icon={<Ionicons name="person-outline" size={20} color="#363636" />}
                />

                <InputField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                  icon={<Ionicons name="mail-outline" size={20} color="#999" />}
                />

                {/* Info Card - matching design language */}
                <InfoCard>
                  <Stack flexDirection="row" alignItems="center" space="$3">
                    <Stack
                      width={40}
                      height={40}
                      backgroundColor="#FFF3CD"
                      borderRadius={12}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name="information-circle" size={20} color="#856404" />
                    </Stack>
                    <Stack flex={1}>
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color="#856404"
                        fontFamily="Baloo2SemiBold"
                        marginBottom="$1"
                      >
                        Email Restriction
                      </Text>
                      <Text
                        fontSize={12}
                        color="#856404"
                        fontFamily="Baloo2Regular"
                        lineHeight={16}
                      >
                        Email cannot be changed from this screen. Contact support if you need to update your email address.
                      </Text>
                    </Stack>
                  </Stack>
                </InfoCard>
              </Stack>

              {/* Save Button - matching design */}
              <SaveButton
                onPress={handleSave}
                isLoading={isLoading}
                disabled={isLoading || !hasChanges()}
              />
            </Stack>
          </ScrollView>
        </Stack>
      </KeyboardAvoidingView>
    </>
  );
} 