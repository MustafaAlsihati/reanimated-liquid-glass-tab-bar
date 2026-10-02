import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {
  LiquidGlassTabBar,
  TabBarCollapseProvider,
  type TabBarItem,
} from 'reanimated-liquid-glass-tab-bar';
import { useAppTheme } from '../../components/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const icon =
  (name: IconName, focusedName: IconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} color={color} size={size} />
  );

const items: TabBarItem[] = [
  { key: 'home', label: 'Home', icon: icon('home-outline', 'home') },
  { key: 'inbox', label: 'Inbox', badge: 3, icon: icon('mail-outline', 'mail') },
  { key: 'profile', label: 'Profile', icon: icon('person-outline', 'person') },
];

const bubbleItem: TabBarItem = {
  key: 'cart',
  label: 'Cart',
  badge: 2,
  icon: icon('cart-outline', 'cart'),
};

const darkTheme = {
  activeColor: '#0A84FF',
  inactiveColor: '#AEAEB2',
  glassTint: 'rgba(28,28,30,0.55)',
  borderColor: 'rgba(255,255,255,0.15)',
};

export default function TabsLayout() {
  const { dark } = useAppTheme();

  return (
    <TabBarCollapseProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={props => (
          <LiquidGlassTabBar
            {...props}
            items={items}
            bubbleItem={bubbleItem}
            theme={dark ? darkTheme : undefined}
            blurTint={dark ? 'dark' : 'light'}
          />
        )}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="inbox" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="cart" />
      </Tabs>
    </TabBarCollapseProvider>
  );
}
