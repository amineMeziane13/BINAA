import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { card3D, modal3D } from '../theme/neumorphism';
import { typography } from '../theme/typography';

interface Props {
  label: string;
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}

export default function Dropdown({ label, items, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.selector, card3D()]} onPress={() => setOpen(true)}>
        <Text style={[styles.selectorText, !selected && styles.placeholder]}>
          {selected || `Sélectionner ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, modal3D()]}>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, item === selected && styles.selected]}
                  onPress={() => { onSelect(item); setOpen(false); }}
                >
                  <Text style={[styles.itemText, item === selected && styles.selectedText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 6 },
  selector: { padding: 14, borderRadius: 12 },
  selectorText: { ...typography.body, color: colors.text },
  placeholder: { color: colors.textSecondary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { maxHeight: 400, padding: 8 },
  item: { padding: 14, borderRadius: 10, marginVertical: 2 },
  selected: { backgroundColor: colors.primaryLight },
  itemText: { ...typography.body, color: colors.text },
  selectedText: { color: colors.textLight, fontWeight: '600' },
});
