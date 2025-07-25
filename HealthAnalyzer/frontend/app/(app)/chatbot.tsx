import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard, View, Alert } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { 
  Ionicons, 
  MaterialIcons
} from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  SlideInRight,
  SlideInLeft
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendChatbotMessage } from '../../lib/api';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  citations?: string[];
}

// Chat Bubble Component
interface ChatBubbleProps {
  message: Message;
  isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser }) => {
  return (
    <AnimatedView
      entering={isUser ? SlideInRight.delay(100) : SlideInLeft.delay(100)}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 12,
        marginHorizontal: 16,
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? "#363636" : "#F0F0F0",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopRightRadius: isUser ? 8 : 20,
          borderTopLeftRadius: isUser ? 20 : 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: isUser ? "white" : "#363636",
            fontFamily: "Baloo2Regular",
            lineHeight: 22,
          }}
        >
          {message.text}
        </Text>
        
        {/* Citations if available */}
        {message.citations && message.citations.length > 0 && (
          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isUser ? "#555" : "#E0E0E0" }}>
            <Text style={{ fontSize: 12, color: isUser ? "#CCC" : "#666", fontFamily: "Baloo2Regular", marginBottom: 4 }}>
              Sources:
            </Text>
            {message.citations.map((citation, index) => (
              <Text key={index} style={{ fontSize: 11, color: isUser ? "#AAA" : "#888", fontFamily: "Baloo2Regular" }}>
                • {citation}
              </Text>
            ))}
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 12,
          color: "#B0B0B0",
          fontFamily: "Baloo2Regular",
          marginTop: 4,
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          marginHorizontal: 8,
        }}
      >
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </AnimatedView>
  );
};

// Ms. Labelly Avatar Component
const MsLabellyAvatar = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  useEffect(() => {
    const animate = () => {
      scale.value = withSpring(1.05, {
        damping: 15,
        stiffness: 200,
      });
      rotation.value = withTiming(2, { duration: 1000 });
      
      setTimeout(() => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
        rotation.value = withTiming(-2, { duration: 1000 });
      }, 1000);

      setTimeout(() => {
        rotation.value = withTiming(0, { duration: 1000 });
      }, 2000);
    };

    const interval = setInterval(animate, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedView style={animatedStyle}>
      <View
        style={{
          width: 50,
          height: 50,
          backgroundColor: "#363636",
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 3,
          borderColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <MaterialIcons name="smart-toy" size={24} color="white" />
      </View>
    </AnimatedView>
  );
};

// Send Button Component
interface SendButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onPress, disabled }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(disabled ? 0.5 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 });
  }, [disabled]);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePress = () => {
    if (!disabled) {
      runOnJS(onPress)();
    }
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          width: 36,
          height: 36,
          backgroundColor: disabled ? "#D0D0D0" : "#363636",
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle
      ]}
      disabled={disabled}
    >
      <Ionicons name="send" size={18} color="white" />
    </AnimatedTouchableOpacity>
  );
};

// Quick Reply Component
interface QuickReplyProps {
  text: string;
  onPress: () => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ text, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    runOnJS(onPress)();
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ marginRight: 8, marginBottom: 8 }, animatedStyle]}
    >
      <View
        style={{
          backgroundColor: "#E8E8E8",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: "#D0D0D0",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#363636",
            fontFamily: "Baloo2Regular",
          }}
        >
          {text}
        </Text>
      </View>
    </AnimatedTouchableOpacity>
  );
};

export default function ChatbotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Ms. Labelly, your personal health assistant. I can help you understand ingredients, suggest healthier alternatives, and answer any questions about nutrition and wellness. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);

  const quickReplies = [
    "What ingredients should I avoid?",
    "How to read nutrition labels?",
    "Suggest healthy alternatives for my recent scans",
    "What are the healthiest cooking oils?"
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Optional: scroll adjustment when keyboard hides
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const response = await sendChatbotMessage(userMessage);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        citations: response.citations || []
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Fallback response in case of error
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. In the meantime, remember to look for whole, unprocessed ingredients on food labels!",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      scrollToBottom();
      
      // Show alert for persistent errors
      Alert.alert(
        "Connection Issue",
        "I'm having trouble connecting to get you the latest information. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();
    
    getBotResponse(inputText.trim());
  };

  const handleQuickReply = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();
    
    getBotResponse(text);
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={{ flex: 1, backgroundColor: "#FDFAF6" }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 16 }}>
            {/* Back Button */}
            <View style={{ marginBottom: 32 }}>
              <TouchableOpacity onPress={handleBack}>
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  paddingVertical: 8
                }}>
                  <Ionicons name="arrow-back" size={24} color="#363636" />
                  <Text style={{ 
                    fontSize: 18, 
                    fontFamily: "Baloo2SemiBold", 
                    color: "#363636",
                    marginLeft: 8
                  }}>
                    Back
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Centered Ms. Labelly Header */}
            <View style={{ alignItems: "center" }}>
              <MsLabellyAvatar />
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <Text style={{
                  fontSize: 28,
                  fontWeight: "600",
                  color: "#363636",
                  fontFamily: "Baloo2SemiBold",
                  textAlign: "center"
                }}>
                  Ms. Labelly
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: "#B0B0B0",
                  fontFamily: "Baloo2Regular",
                  textAlign: "center",
                  marginTop: 4
                }}>
                  Your Health Assistant
                </Text>
              </View>
            </View>

            {/* Subtle divider */}
            <View style={{
              height: 1,
              backgroundColor: "#E0E0E0",
              marginTop: 24,
              marginHorizontal: 16,
              opacity: 0.5
            }} />
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingTop: 16, 
              paddingBottom: 16,
              flexGrow: 1 
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isUser={message.isUser}
              />
            ))}

            {isTyping && (
              <AnimatedView
                entering={FadeIn}
                style={{
                  alignSelf: "flex-start",
                  marginHorizontal: 16,
                  marginBottom: 12
                }}
              >
                <View style={{
                  backgroundColor: "#F0F0F0",
                  borderRadius: 20,
                  borderTopLeftRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center"
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: "#363636",
                    fontFamily: "Baloo2Regular",
                    marginRight: 8
                  }}>
                    Ms. Labelly is thinking
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ width: 4, height: 4, backgroundColor: "#B0B0B0", borderRadius: 2, marginRight: 4 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: "#B0B0B0", borderRadius: 2, marginRight: 4 }} />
                    <View style={{ width: 4, height: 4, backgroundColor: "#B0B0B0", borderRadius: 2 }} />
                  </View>
                </View>
              </AnimatedView>
            )}
          </ScrollView>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <AnimatedView
              entering={FadeIn.delay(500)}
              style={{
                paddingHorizontal: 16,
                paddingBottom: 12
              }}
            >
              <Text style={{
                fontSize: 14,
                color: "#B0B0B0",
                fontFamily: "Baloo2Regular",
                marginBottom: 8,
                marginLeft: 4
              }}>
                Quick questions:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {quickReplies.map((reply, index) => (
                  <QuickReply
                    key={index}
                    text={reply}
                    onPress={() => handleQuickReply(reply)}
                  />
                ))}
              </View>
            </AnimatedView>
          )}

          {/* Input Area */}
          <View style={{
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: Math.max(insets.bottom, 16)
          }}>
            <View style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: "#F8F8F8",
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#E8E8E8",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Ms. Labelly anything..."
                placeholderTextColor="#B0B0B0"
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: 'Baloo2Regular',
                  color: '#363636',
                  maxHeight: 100,
                  paddingVertical: 8,
                  lineHeight: 22,
                  marginRight: 12
                }}
                multiline
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
              <SendButton
                onPress={handleSendMessage}
                disabled={inputText.trim() === '' || isTyping}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
} 