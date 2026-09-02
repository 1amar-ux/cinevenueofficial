import React from "react";
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

export default function Seat({ seat, onSelect }: SeatProps) {
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
