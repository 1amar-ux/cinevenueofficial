import React, { useState, useContext, useCallback } from "react";
import Seat from "./Seat";
import { BookingContext } from "../context/BookingContext";
import { centralizedPricingClient } from "../services/centralizedPricingService";

interface SeatState {
  id: string;
  booked: boolean;
  selected: boolean;
}

export default function SeatLayout() {
  const { setBooking } = useContext(BookingContext);

  const createSeats = () => {
    const seats: SeatState[] = [];
    const rows = ["A", "B", "C", "D", "E"];

    rows.forEach((row) => {
      for (let i = 1; i <= 10; i++) {
        seats.push({
          id: `${row}${i}`,
          booked: Math.random() < 0.2,
          selected: false,
        });
      }
    });

    return seats;
  };

  const [seats, setSeats] = useState<SeatState[]>(() => createSeats());

  const toggleSeat = useCallback((id: string) => {
    setSeats((prev) => {
      const updated = prev.map((seat) =>
        seat.id === id ? { ...seat, selected: !seat.selected } : seat
      );

      const selectedIds = updated.filter((s) => s.selected).map((s) => s.id);

      if (selectedIds.length === 0) {
        setBooking((prevBooking) => ({
          ...prevBooking,
          seats: [],
          total: 0,
          ticketSubtotal: 0,
          convenienceFee: 0,
          taxAmount: 0,
          pricingBreakdown: null,
        }));
        return updated;
      }

      // Authoritative slab calculation (₹250 per seat)
      const tickets = selectedIds.map(() => ({ price: 250, category: "STANDARD" }));
      const immediateCalc = centralizedPricingClient.calculateLocalFallback({
        itemType: "MOVIE",
        tickets,
      });

      setBooking((prevBooking) => ({
        ...prevBooking,
        seats: selectedIds,
        total: immediateCalc.finalPayableAmount,
        ticketSubtotal: immediateCalc.ticketSubtotal,
        convenienceFee: immediateCalc.baseConvenienceFee,
        taxAmount: immediateCalc.convenienceFeeGstTotal,
        pricingBreakdown: immediateCalc,
      }));

      // Async backend authoritative calculation
      centralizedPricingClient
        .calculatePrice({
          itemType: "MOVIE",
          tickets,
        })
        .then((serverCalc) => {
          if (serverCalc) {
            setBooking((prevBooking) => ({
              ...prevBooking,
              total: serverCalc.finalPayableAmount,
              ticketSubtotal: serverCalc.ticketSubtotal,
              convenienceFee: serverCalc.baseConvenienceFee,
              taxAmount: serverCalc.convenienceFeeGstTotal,
              pricingBreakdown: serverCalc,
            }));
          }
        })
        .catch(() => {
          // Keep immediate calculation on network error
        });

      return updated;
    });
  }, [setBooking]);

  return (
    <div style={{ textAlign: "center", margin: "20px 0", maxWidth: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "12px" }}>
      <div style={{ minWidth: "max-content", margin: "0 auto", padding: "0 8px" }}>
        {["A", "B", "C", "D", "E"].map((row) => (
          <div key={row} style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            {seats
              .filter((seat) => seat.id.startsWith(row))
              .map((seat) => (
                <Seat key={seat.id} seat={seat} onSelect={toggleSeat} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
