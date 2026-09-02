import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface BookingItem {
  movie: string;
  date: string;
  seats: string;
  amount: number;
}

const defaultBookings: BookingItem[] = [
  {
    movie: "Pushpa 2",
    date: "25 June",
    seats: "A1 A2",
    amount: 500
  },
  {
    movie: "Salaar",
    date: "20 June",
    seats: "B4 B5",
    amount: 600
  }
];

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingItem[]>(defaultBookings);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const local = localStorage.getItem("localBookings");
        let localList: BookingItem[] = [];
        if (local) {
          localList = JSON.parse(local);
        }

        try {
          const res = await api.get("/bookings/my");
          if (res.data && res.data.bookings) {
            const serverList = res.data.bookings.map((b: any) => ({
              movie: b.movieName,
              date: "Today",
              seats: b.seats.join(" "),
              amount: b.totalAmount
            }));
            setBookings([...serverList, ...localList, ...defaultBookings]);
            return;
          }
        } catch (e) {
          console.log("No server bookings found, using local storage");
        }

        if (localList.length > 0) {
          setBookings([...localList, ...defaultBookings]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Container sx={{ mt: 12, mb: 4 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: "#F84464",
            borderColor: "#F84464",
            "&:hover": {
              borderColor: "#df3553",
              backgroundColor: "rgba(248, 68, 100, 0.08)",
            },
          }}
          variant="outlined"
        >
          Back
        </Button>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        Booking History
      </Typography>

      {bookings.length === 0 ? (
        <Typography color="text.secondary">No bookings found</Typography>
      ) : (
        bookings.map((b, index) => (
          <Card key={index} sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {b.movie}
                </Typography>
                <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: "bold" }}>
                  Paid: ₹{b.amount}
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Date: {b.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seats: <span style={{ fontWeight: 600 }}>{b.seats}</span>
                </Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Past Bookings:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: "warning.main",
                    backgroundColor: "rgba(237, 108, 2, 0.08)",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {bookings.filter((_, idx) => idx !== index).length} prior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
