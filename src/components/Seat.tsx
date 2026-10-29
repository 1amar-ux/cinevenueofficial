import React, { memo } from "react";
import { Button } from "@mui/material";

interface SeatType {
  id: string;
  booked: boolean;
  selected: boolean;
}

interface SeatProps {
  seat: SeatType;
  onSelect: (id: string) => void;
}

function Seat({ seat, onSelect }: SeatProps) {
  return (
    <Button
      variant={seat.selected ? "contained" : "outlined"}
      color={seat.booked ? "error" : "success"}
      disabled={seat.booked}
      onClick={() => onSelect(seat.id)}
      sx={{ minWidth: 45, margin: 0.5 }}
    >
      {seat.id}
    </Button>
  );
}

export default memo(Seat, (prev, next) => {
  return (
    prev.seat.id === next.seat.id &&
    prev.seat.selected === next.seat.selected &&
    prev.seat.booked === next.seat.booked &&
    prev.onSelect === next.onSelect
  );
});
