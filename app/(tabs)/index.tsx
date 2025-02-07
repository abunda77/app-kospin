import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { useState } from 'react';

interface MenuItem {
  id: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: "/(tabs)/qris" | "/(tabs)/brizzi" | "/(tabs)/ewallet" | "/(tabs)/explore";
}

const menuItems: MenuItem[] = [
  { id: 1, icon: 'card', label: 'QRIS', route: '/(tabs)/qris' },
  { id: 2, icon: 'wallet', label: 'BRIZZI', route: '/(tabs)/brizzi' },
  { id: 3, icon: 'cash', label: 'E Wallet', route: '/(tabs)/ewallet' },
  { id: 4, icon: 'phone-portrait', label: 'BRIVA', route: '/(tabs)/explore' },
  { id: 5, icon: 'swap-horizontal', label: 'Transfer', route: '/(tabs)/explore' },
];

export default function HomeScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const formHeight = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const loginContainerOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: formHeight.value,
      opacity: formOpacity.value,
      overflow: 'hidden',
    };
  });

  const loginContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: loginContainerOpacity.value,
    };
  });

  const toggleLoginForm = () => {
    if (!showLogin) {
      setShowLogin(true);
      formHeight.value = withSpring(280);
      formOpacity.value = withTiming(1, { duration: 300 });
      loginContainerOpacity.value = withTiming(0, { duration: 200 });
    } else {
      formHeight.value = withSpring(0);
      formOpacity.value = withTiming(0, { duration: 200 });
      loginContainerOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => setShowLogin(false), 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.languageSelector}>
              <Image 
                source={require("@/assets/images/id-flag.png")} 
                style={styles.flagIcon}
              />
              <Text style={styles.languageText}>ID</Text>
            </View>
            
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Lingkungan Aman</Text>
            </View>
          </View>

          {/* Promo Banner */}
          <View style={styles.promoBanner}>
           <Image 
              source={require("@/assets/images/banner_promo_mobile.png")} 
              style={styles.promoBannerImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Fast Menu Section */}
        <View style={styles.fastMenuSection}>
          <View style={styles.fastMenuHeader}>
            <Text style={styles.fastMenuTitle}>Fast Menu</Text>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
          </View>
          
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <Link href={item.route} key={item.id} asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={24} color="#0066AE" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Login Button */}
      <Animated.View style={[styles.loginContainer, loginContainerStyle]}>
        <TouchableOpacity 
          style={[
            styles.loginButton, 
            showLogin && styles.loginButtonActive,
            { justifyContent: 'center', alignItems: 'center' }
          ]} 
          onPress={toggleLoginForm}
        >
          <Text style={[styles.loginText, { color: '#fff' }]}>Login</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity 
          style={[
            styles.biometricButton,
            { justifyContent: 'center', alignItems: 'center' }
          ]}
        >
          <Ionicons name="finger-print" size={28} color="#0066AE" />
        </TouchableOpacity> */}
      </Animated.View>

      {/* Login Form Overlay */}
      {showLogin && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleLoginForm}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.loginForm} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={toggleLoginForm}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.loginHeader}>Silakan Login</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                placeholder="Username"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Masuk</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0066Ae',
    //backgroundColor: '#ff9900',
    padding: 16,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 20,
  },
  flagIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  logoHeader: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    borderRadius: 20,
  },
  securityText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  promoBanner: {
    width: '100%',
    height: 'auto',
    marginHorizontal: -16,
    marginBottom: -16,
  },
  promoBannerImage: {
    width: '110%',
    height: 350,
  },
  fastMenuSection: {
    padding: 16,
  },
  fastMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  fastMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  menuItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  loginContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,  
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderTopColor: '#eee',
  },
  loginButton: {
    backgroundColor: '#0066AE',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
  },
  loginButtonActive: {
    backgroundColor: '#004c8c',
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginForm: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    elevation: 6,
    width: '85%',
    maxWidth: 400,
  },
  loginHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0066AE',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#0066AE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
});
