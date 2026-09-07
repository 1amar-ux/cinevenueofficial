import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { SeatInfo } from '../../types/movie';

interface InteractiveSeatMapProps {
  seats: SeatInfo[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  screenName?: string;
}

export const InteractiveSeatMap: React.FC<InteractiveSeatMapProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  screenName = 'Screen 1',
}) => {
  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  const getSeatStyle = (seat: SeatInfo) => {
    const isSelected = selectedSeats.includes(seat.id) || selectedSeats.includes(seat.seatNumber);
    const isUnavailable = seat.status === 'SOLD' || seat.status === 'BLOCKED' || seat.status === 'HELD';

    if (isSelected) {
      return styles.seatSelected;
    }
    if (isUnavailable) {
      return styles.seatSold;
    }
    if (seat.tier === 'VIP' || seat.tier === 'RECLINER') {
      return styles.seatVip;
    }
    return styles.seatAvailable;
  };

  const getSeatTextStyle = (seat: SeatInfo) => {
    const isSelected = selectedSeats.includes(seat.id) || selectedSeats.includes(seat.seatNumber);
    const isUnavailable = seat.status === 'SOLD' || seat.status === 'BLOCKED' || seat.status === 'HELD';

    if (isSelected) return styles.seatTextSelected;
    if (isUnavailable) return styles.seatTextSold;
    return styles.seatTextAvailable;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.gridContainer}>
        {/* Curved Screen Banner */}
        <View style={styles.screenCurve}>
          <Text style={styles.screenLabel}>SCREEN THIS WAY ({screenName})</Text>
        </View>

        {/* Seat Rows Grid */}
        <View style={styles.rowsContainer}>
          {rows.map((rowLetter) => {
            const rowSeats = seats
              .filter((s) => s.row === rowLetter)
              .sort((a, b) => a.column - b.column);

            return (
              <View key={rowLetter} style={styles.row}>
                <Text style={styles.rowLetter}>{rowLetter}</Text>
                <View style={styles.seatRow}>
                  {rowSeats.map((seat) => {
                    const isUnavailable =
                      seat.status === 'SOLD' ||
                      seat.status === 'BLOCKED' ||
                      seat.status === 'HELD';

                    return (
                      <TouchableOpacity
                        key={seat.id || `${seat.row}${seat.column}`}
                        style={[styles.seatBox, getSeatStyle(seat)]}
                        disabled={isUnavailable}
                        onPress={() => onToggleSeat(seat.id || seat.seatNumber)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.seatNumber, getSeatTextStyle(seat)]}>
                          {seat.column}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.rowLetter}>{rowLetter}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatAvailable]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatSelected]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatSold]} />
            <Text style={styles.legendText}>Sold</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatVip]} />
            <Text style={styles.legendText}>VIP / Recliner</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  gridContainer: {
    alignItems: 'center',
    minWidth: 320,
  },
  screenCurve: {
    width: 280,
    height: 18,
    borderTopWidth: 3,
    borderTopColor: Colors.gold,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  screenLabel: {
    ...Typography.caption,
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginTop: 4,
  },
  rowsContainer: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowLetter: {
    width: 20,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  seatRow: {
    flexDirection: 'row',
    gap: 6,
  },
  seatBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatNumber: {
    fontSize: 10,
    fontWeight: '700',
  },
  seatAvailable: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  seatTextAvailable: {
    color: Colors.textPrimary,
  },
  seatSelected: {
    backgroundColor: Colors.gold,
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  seatTextSelected: {
    color: '#000000',
  },
  seatSold: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.4,
  },
  seatTextSold: {
    color: Colors.textMuted,
  },
  seatVip: {
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
