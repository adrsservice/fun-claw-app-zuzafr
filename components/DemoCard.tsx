
import React from "react";
import { Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { DemoItem } from "./homeData";

interface DemoCardProps {
  item: DemoItem;
}

export function DemoCard({ item }: DemoCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#2a2a2a' : '#fff',
          borderColor: isDark ? '#444' : '#e0e0e0',
        },
      ]}
      onPress={() => router.push(item.route as any)}
    >
      {item.icon && <Text style={styles.icon}>{item.icon}</Text>}
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{item.title}</Text>
      <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
