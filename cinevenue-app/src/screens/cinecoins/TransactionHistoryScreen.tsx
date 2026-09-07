import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { cineCoinApi } from '../../api/services';
import { CineCoinTransaction } from '../../types';

export const TransactionHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<CineCoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await cineCoinApi.getTransactions();
      setTransactions(data);
    } catch (e) {
      // Fallback preview data
      setTransactions([
        {
          id: 'tx-1',
          type: 'EARNED',
          amount: 50,
          description: 'Booking CashBack Reward - Avatar 3',
          timestamp: 'Today, 2:30 PM',
          status: 'COMPLETED',
        },
        {
          id: 'tx-2',
          type: 'EARNED',
          amount: 10,
          description: 'Daily Check-in Vault Bonus',
          timestamp: 'Yesterday, 9:15 AM',
          status: 'COMPLETED',
        },
        {
          id: 'tx-3',
          type: 'SPENT',
          amount: 120,
          description: 'Instant Discount Applied on Inception VIP',
          timestamp: 'Sep 02, 2026',
          status: 'COMPLETED',
        },
        {
          id: 'tx-4',
          type: 'EARNED',
          amount: 25,
          description: 'Lucky Spin Wheel Prize',
          timestamp: 'Aug 29, 2026',
          status: 'COMPLETED',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="CineCoin History" subtitle="Ledger of all rewards earned and redeemed" showBack />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySub}>
                Book movies or spin the daily wheel to earn CineCoins!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isEarned = item.type === 'EARNED';
            return (
              <View style={styles.txCard}>
                <View
                  style={[
                    styles.txIconBox,
                    { backgroundColor: isEarned ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
                  ]}
                >
                  <Ionicons
                    name={isEarned ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={22}
                    color={isEarned ? '#4ADE80' : '#EF4444'}
                  />
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={styles.txDate}>{item.timestamp}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: isEarned ? '#4ADE80' : Colors.textSecondary },
                  ]}
                >
                  {isEarned ? '+' : '-'}{item.amount}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  txIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    ...Typography.body1,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
  },
  emptySub: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
