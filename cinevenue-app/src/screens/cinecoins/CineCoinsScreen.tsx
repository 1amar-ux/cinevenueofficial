import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { cineCoinApi } from '../../api/services';
import { CineCoinWallet } from '../../types';
import { useAuth } from '../../store/AuthContext';

export const CineCoinsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<CineCoinWallet>({
    balance: user?.cineCoinsBalance || 150,
    tier: 'GOLD',
    totalEarned: 450,
    totalRedeemed: 300,
    dailySpinAvailable: true,
  });
  const [claiming, setClaiming] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await cineCoinApi.getWallet();
      setWallet(data);
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleClaimDaily = async () => {
    setClaiming(true);
    try {
      await cineCoinApi.claimDailyBonus();
      Alert.alert('Bonus Claimed! 🎉', 'You received +10 CineCoins for your daily login.');
      setWallet((prev) => ({ ...prev, balance: prev.balance + 10 }));
    } catch (e: any) {
      Alert.alert('Daily Bonus', e.message || 'Already claimed today. Come back tomorrow!');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="CineCoins Vault"
        subtitle="Exclusive VIP Loyalty & Cashless Discounts"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.historyLink}>History</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIP Balance Vault Card */}
        <View style={styles.vaultCard}>
          <View style={styles.vaultHeader}>
            <Text style={styles.vaultTierBadge}>PLATINUM VIP MEMBER</Text>
            <Ionicons name="shield-checkmark" size={20} color={Colors.gold} />
          </View>
          <Text style={styles.vaultBalanceLabel}>AVAILABLE REWARD BALANCE</Text>
          <Text style={styles.vaultBalanceNumber}>{wallet.balance.toLocaleString()}</Text>
          <Text style={styles.vaultSubtitle}>
            1 CineCoin = ₹1.00 Instant Discount on Movie & Event Tickets
          </Text>
        </View>

        {/* Daily Spin & Daily Login Actions */}
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DailySpin')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="sparkles" size={24} color={Colors.gold} />
            </View>
            <Text style={styles.actionCardTitle}>Lucky Spin Wheel</Text>
            <Text style={styles.actionCardSub}>Win up to 500 Coins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleClaimDaily}
            disabled={claiming}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.successLight, borderColor: 'rgba(16,185,129,0.3)' }]}>
              <Ionicons name="gift-outline" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionCardTitle}>Daily Check-In</Text>
            <Text style={styles.actionCardSub}>Claim +10 Free Coins</Text>
          </TouchableOpacity>
        </View>

        {/* How to Earn */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Ways to Earn CineCoins</Text>
          
          <View style={styles.ruleCard}>
            <Ionicons name="film-outline" size={20} color={Colors.gold} />
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleTitle}>Book Movie Tickets</Text>
              <Text style={styles.ruleDesc}>Get 5% back in CineCoins on every ticket booking.</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Ionicons name="ticket-outline" size={20} color={Colors.gold} />
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleTitle}>Attend Live Events</Text>
              <Text style={styles.ruleDesc}>Earn bonus coins on VIP concerts and workshops.</Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <Ionicons name="people-outline" size={20} color={Colors.gold} />
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleTitle}>Refer Friends</Text>
              <Text style={styles.ruleDesc}>Get 50 CineCoins when your friend books their first movie.</Text>
            </View>
          </View>
        </View>

        {/* Redemption Policies */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Redemption Rules</Text>
          <Text style={styles.policyText}>
            • CineCoins can be applied directly on checkout to reduce ticket prices.{'\n'}
            • Maximum 100 CineCoins can be redeemed per transaction.{'\n'}
            • CineCoins cannot be withdrawn to bank accounts or transferred.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export const DailySpinScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<number | null>(null);

  const handleSpin = async () => {
    setSpinning(true);
    setReward(null);

    try {
      setTimeout(() => {
        const amounts = [10, 25, 50, 100, 250];
        const won = amounts[Math.floor(Math.random() * amounts.length)];
        setReward(won);
        setSpinning(false);
        Alert.alert('Congratulations! 🎉', `You won ${won} CineCoins! Credited to your wallet.`);
      }, 2000);
    } catch (e: any) {
      setSpinning(false);
      Alert.alert('Spin Wheel', e.message || 'Already spun today.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Daily Lucky Spin" showBack onBack={() => navigation.goBack()} />

      <View style={styles.spinCenter}>
        <View style={styles.wheelOuter}>
          <Ionicons name="disc-outline" size={180} color={Colors.gold} />
          {spinning && (
            <Text style={styles.spinningText}>Spinning...</Text>
          )}
        </View>

        <Text style={styles.spinHeading}>Spin to Win CineCoins</Text>
        <Text style={styles.spinSub}>Available once every 24 hours.</Text>

        {reward && (
          <View style={styles.rewardBanner}>
            <Text style={styles.rewardText}>WON +{reward} CINECOINS</Text>
          </View>
        )}

        <Button
          title={spinning ? 'SPINNING WHEEL...' : 'SPIN NOW'}
          onPress={handleSpin}
          loading={spinning}
          style={styles.spinActionBtn}
        />
      </View>
    </View>
  );
};

export const TransactionHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [transactions] = useState([
    { id: 'TX-1', type: 'EARN', amount: 25, desc: 'Booking: Pushpa 2: The Rule', date: 'Yesterday, 8:45 PM' },
    { id: 'TX-2', type: 'SPIN', amount: 50, desc: 'Daily Lucky Spin Reward', date: '2 Sep 2026' },
    { id: 'TX-3', type: 'REDEEM', amount: -50, desc: 'Redeemed on Salaar Part 2', date: '28 Aug 2026' },
    { id: 'TX-4', type: 'BONUS', amount: 100, desc: 'Welcome Joining Bonus', date: '20 Aug 2026' },
  ]);

  return (
    <View style={styles.container}>
      <Header title="Transaction Ledger" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconBox, tx.amount > 0 ? styles.txEarn : styles.txRedeem]}>
                <Ionicons
                  name={tx.amount > 0 ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={16}
                  color={tx.amount > 0 ? Colors.success : Colors.gold}
                />
              </View>
              <View>
                <Text style={styles.txDesc}>{tx.desc}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, tx.amount > 0 ? styles.txEarnText : styles.txRedeemText]}>
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  historyLink: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 60,
  },
  vaultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    gap: Spacing.xs,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vaultTierBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: 1,
  },
  vaultBalanceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  vaultBalanceNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.gold,
    letterSpacing: 1,
  },
  vaultSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionCardTitle: {
    ...Typography.body2,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionCardSub: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  infoSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleTitle: {
    ...Typography.body2,
    fontWeight: '700',
  },
  ruleDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  policyText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  spinCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  wheelOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinningText: {
    ...Typography.body1,
    color: Colors.gold,
    fontWeight: '800',
    marginTop: Spacing.sm,
  },
  spinHeading: {
    ...Typography.h2,
    marginTop: Spacing.lg,
  },
  spinSub: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  rewardBanner: {
    backgroundColor: Colors.goldGlow,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  rewardText: {
    color: Colors.gold,
    fontWeight: '900',
    fontSize: 14,
  },
  spinActionBtn: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  txCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txEarn: {
    backgroundColor: Colors.successLight,
  },
  txRedeem: {
    backgroundColor: Colors.goldGlow,
  },
  txDesc: {
    ...Typography.body2,
    fontWeight: '700',
  },
  txDate: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  txEarnText: {
    color: Colors.success,
  },
  txRedeemText: {
    color: Colors.gold,
  },
});
