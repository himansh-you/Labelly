import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

interface CameraViewProps {
  onImageCaptured?: (image: CapturedImage) => void;
  onClose?: () => void;
}

export default function CameraView({ onImageCaptured, onClose }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation();

  // Handle permission states
  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Text style={styles.subText}>
          Please allow camera access to scan ingredient labels
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPicture) {
      setIsTakingPicture(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        setCapturedImage(photo);
        
        if (onImageCaptured) {
          onImageCaptured(photo);
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
      } finally {
        setIsTakingPicture(false);
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage.uri }} style={styles.camera} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={retakePicture}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          {onImageCaptured && (
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={() => {
                // The image has already been passed to onImageCaptured, just close the view
                if (onClose) onClose();
              }}
            >
              <Text style={styles.buttonText}>Use Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView 
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>
            Position the ingredients label in the frame
          </Text>
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Text style={styles.controlText}>
              Flash: {flash === 'off' ? 'Off' : flash === 'on' ? 'On' : 'Auto'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bottomControlsContainer}>
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={takePicture}
            disabled={isTakingPicture}
          >
            {isTakingPicture ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    flex: 1,
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    margin: 10,
  },
  subText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    margin: 10,
    marginBottom: 30,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  controlsContainer: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  controlText: {
    color: 'white',
    fontSize: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
}); 