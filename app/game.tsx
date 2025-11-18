
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLAW_SIZE = 60;
const ITEM_SIZE = 50;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.7;
const BOTTOM_AREA_HEIGHT = 150;

interface Item {
  id: number;
  emoji: string;
  x: number;
  y: number;
  caught: boolean;
}

export default function GameScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Claw position and animation
  const clawX = useRef(new Animated.Value(0)).current;
  const clawY = useRef(new Animated.Value(0)).current;
  const ropeLength = useRef(new Animated.Value(0)).current;

  // Game state
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [isDescending, setIsDescending] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(3000);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  // Initialize items at the bottom
  useEffect(() => {
    const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑'];
    const initialItems: Item[] = [];
    
    for (let i = 0; i < 10; i++) {
      initialItems.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE - 40) + 20,
        y: GAME_AREA_HEIGHT - BOTTOM_AREA_HEIGHT + Math.random() * 80,
        caught: false,
      });
    }
    
    setItems(initialItems);
  }, []);

  // Horizontal claw movement with random speed
  useEffect(() => {
    if (isDescending) return;

    const moveHorizontally = () => {
      const randomSpeed = Math.random() * 2000 + 2000; // 2-4 seconds
      setCurrentSpeed(randomSpeed);

      const targetX = direction === 'right' ? SCREEN_WIDTH - CLAW_SIZE - 20 : 0;

      Animated.timing(clawX, {
        toValue: targetX,
        duration: randomSpeed,
        useNativeDriver: true,
      }).start(() => {
        setDirection(direction === 'right' ? 'left' : 'right');
      });
    };

    moveHorizontally();
  }, [direction, isDescending]);

  const handleCatch = async () => {
    if (isDescending) return;

    setIsDescending(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Stop horizontal movement
    clawX.stopAnimation((currentX) => {
      // Descend animation
      Animated.parallel([
        Animated.timing(clawY, {
          toValue: GAME_AREA_HEIGHT - BOTTOM_AREA_HEIGHT - 20,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(ropeLength, {
          toValue: GAME_AREA_HEIGHT - BOTTOM_AREA_HEIGHT - 20,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start(async () => {
        // Check for caught items
        const clawPosition = currentX + CLAW_SIZE / 2;
        const clawBottom = GAME_AREA_HEIGHT - BOTTOM_AREA_HEIGHT;

        let caughtItem: Item | null = null;
        const updatedItems = items.map((item) => {
          if (
            !item.caught &&
            Math.abs(item.x + ITEM_SIZE / 2 - clawPosition) < ITEM_SIZE / 2 &&
            Math.abs(item.y - clawBottom) < ITEM_SIZE
          ) {
            caughtItem = item;
            return { ...item, caught: true };
          }
          return item;
        });

        if (caughtItem) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setScore((prev) => prev + 1);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        setItems(updatedItems);

        // Ascend animation
        Animated.parallel([
          Animated.timing(clawY, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ropeLength, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setIsDescending(false);
        });
      });
    });
  };

  const resetGame = () => {
    const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑'];
    const newItems: Item[] = [];
    
    for (let i = 0; i < 10; i++) {
      newItems.push({
        id: Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE - 40) + 20,
        y: GAME_AREA_HEIGHT - BOTTOM_AREA_HEIGHT + Math.random() * 80,
        caught: false,
      });
    }
    
    setItems(newItems);
    setScore(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#87CEEB' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#333' : '#fff' }]}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Fun Claw</Text>
        <View style={[styles.scoreContainer, { backgroundColor: isDark ? '#333' : '#fff' }]}>
          <Text style={[styles.scoreText, { color: isDark ? '#fff' : '#000' }]}>Score: {score}</Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Rope */}
        <Animated.View
          style={[
            styles.rope,
            {
              height: ropeLength,
              left: Animated.add(clawX, CLAW_SIZE / 2 - 1),
            },
          ]}
        />

        {/* Claw */}
        <Animated.View
          style={[
            styles.claw,
            {
              transform: [
                { translateX: clawX },
                { translateY: clawY },
              ],
            },
          ]}
        >
          <Text style={styles.clawEmoji}>🦞</Text>
        </Animated.View>

        {/* Items at the bottom */}
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.item,
                {
                  left: item.x,
                  top: item.y,
                  opacity: item.caught ? 0 : 1,
                },
              ]}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
          ))}
        </View>

        {/* Ground */}
        <View style={[styles.ground, { backgroundColor: isDark ? '#2a2a2a' : '#8B4513' }]} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.catchButton,
            { backgroundColor: isDescending ? '#999' : '#FF6347' },
          ]}
          onPress={handleCatch}
          disabled={isDescending}
        >
          <Text style={styles.catchButtonText}>
            {isDescending ? 'CATCHING...' : 'CATCH!'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: isDark ? '#444' : '#4682B4' }]}
          onPress={resetGame}
        >
          <Text style={styles.resetButtonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  rope: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: '#333',
    zIndex: 1,
  },
  claw: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CLAW_SIZE,
    height: CLAW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  clawEmoji: {
    fontSize: 50,
  },
  itemsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_AREA_HEIGHT,
  },
  item: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 40,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  catchButton: {
    flex: 2,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  },
  catchButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
