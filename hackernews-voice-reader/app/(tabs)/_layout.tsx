import { Tabs } from 'expo-router';
import { ORANGE, WHITE, FONT_FAMILY } from '@constants/theme';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

const Layout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY,
          fontWeight: '600',
          fontSize: 14,
        },
        tabBarStyle: {
          backgroundColor: WHITE,
          paddingTop: 10
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="all"
        options={{
          title: 'All',
          headerShown: false,
          tabBarIcon: ({ }) => (
            <MaterialIcons name="article" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          headerShown: false,
          tabBarIcon: ({ }) => (
            <Entypo name="help" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="show"
        options={{
          title: 'Show',
          headerShown: false,
          tabBarIcon: ({}) => (
            <Ionicons name="bulb-outline" size={28} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;