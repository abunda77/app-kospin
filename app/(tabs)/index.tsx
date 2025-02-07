import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

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
              source={require("@/assets/images/promo-banner.png")} 
              style={styles.promoBannerImage}
              resizeMode="contain"
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
      <View style={styles.loginContainer}>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.biometricButton}>
          <Ionicons name="finger-print" size={28} color="#0066AE" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0066AE',
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
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
  },
  fastMenuSection: {
    padding: 16,
  },
  fastMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#0066AE',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
