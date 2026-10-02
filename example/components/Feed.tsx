import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  useTabBarScrollHandler,
} from 'reanimated-liquid-glass-tab-bar';
import { useAppTheme } from './theme';

interface FeedProps {
  title: string;
  subtitle: string;
}

/** A scrolling list of colorful cards, so the glass has something to show through. */
export function Feed({ title, subtitle }: FeedProps) {
  const theme = useAppTheme();
  const { top, bottom } = useSafeAreaInsets();
  const onScroll = useTabBarScrollHandler();

  return (
    // The status bar area stays outside the scroll view, so content does not scroll under it.
    <View style={{ flex: 1, paddingTop: top, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          // The bar floats over the content and reserves no space of its own.
          paddingBottom: bottom + TAB_BAR_HEIGHT + DEFAULT_BOTTOM_MARGIN + 16,
          paddingHorizontal: 16,
          gap: 12,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>{subtitle}</Text>
        {Array.from({ length: 12 }, (_, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: theme.cards[index % theme.cards.length] }]}>
            <Text style={styles.cardTitle}>Card {index + 1}</Text>
            <Text style={styles.cardText}>Scroll down to collapse the tab bar, up to expand it.</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 16, marginBottom: 8 },
  card: { height: 120, borderRadius: 24, padding: 20, justifyContent: 'flex-end' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  cardText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});
