import React, { useState, useContext } from "react";
import Seat from "./Seat";
import { BookingContext } from "../context/BookingContext";

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

  const toggleSeat = (id: string) => {
    setSeats((prev) => {
      const updated = prev.map((seat) =>
        seat.id === id ? { ...seat, selected: !seat.selected } : seat
      );

      const selectedIds = updated.filter((s) => s.selected).map((s) => s.id);
      setBooking((prevBooking) => ({
        ...prevBooking,
        seats: selectedIds,
        total: selectedIds.length * 250, // ₹250 per seat
      }));

      return updated;
    });
  };

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
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
  );
}
