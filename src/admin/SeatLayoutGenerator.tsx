import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Slider,
  Card,
  CardContent,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { Save, Refresh, EventSeat, Block, Star } from "@mui/icons-material";

interface CustomSeat {
  id: string;
  row: string;
  col: number;
  type: "Classic" | "Deluxe" | "Premium" | "Disabled";
  price: number;
}

export default function SeatLayoutGenerator() {
  const [rowsCount, setRowsCount] = useState<number>(6);
  const [colsCount, setColsCount] = useState<number>(12);
  const [gapInterval, setGapInterval] = useState<number>(4);
  const [vipRows, setVipRows] = useState<number>(2); // first N rows are premium

  const [pricing, setPricing] = useState({
    Classic: 150,
    Deluxe: 250,
    Premium: 400
  });

  const [brushType, setBrushType] = useState<"Classic" | "Deluxe" | "Premium" | "Disabled">("Premium");
  const [seats, setSeats] = useState<CustomSeat[]>(() => generateInitialLayout(6, 12, 2, 4));
  const [jsonOutput, setJsonOutput] = useState<string>("");

  function generateInitialLayout(rCount: number, cCount: number, vipNum: number, gap: number) {
    const arr: CustomSeat[] = [];
    const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ"; // Skip I to avoid confusion
    for (let r = 0; r < rCount; r++) {
      const rowLetter = alphabet[r] || `R${r + 1}`;
      const isVip = r < vipNum;
      const isDeluxe = r >= vipNum && r < vipNum + 2;

      for (let c = 1; c <= cCount; c++) {
        let type: "Classic" | "Deluxe" | "Premium" = "Classic";
        if (isVip) type = "Premium";
        else if (isDeluxe) type = "Deluxe";

        arr.push({
          id: `${rowLetter}${c}`,
          row: rowLetter,
          col: c,
          type,
          price: pricing[type]
        });
      }
    }
    return arr;
  }

  const handleRebuild = () => {
    const newSeats = generateInitialLayout(rowsCount, colsCount, vipRows, gapInterval);
    setSeats(newSeats);
    setJsonOutput("");
  };

  const handleSeatClick = (id: string) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id === id) {
          const nextType = seat.type === brushType ? "Classic" : brushType;
          return {
            ...seat,
            type: nextType,
            price: nextType === "Disabled" ? 0 : pricing[nextType as keyof typeof pricing]
          };
        }
        return seat;
      })
    );
  };

  const handleSaveLayout = () => {
    const layout = {
      rows: rowsCount,
      columns: colsCount,
      gapAfterColumn: gapInterval,
      totalSeats: seats.filter((s) => s.type !== "Disabled").length,
      pricing,
      layoutGrid: seats.map((s) => ({
        id: s.id,
        row: s.row,
        col: s.col,
        type: s.type,
        price: s.price
      }))
    };
    setJsonOutput(JSON.stringify(layout, null, 2));
    alert("Seat Layout Generated and Saved Successfully!");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }} color="text.primary">
        Interactive Seat Layout Generator
      </Typography>

      {/* Tailwind Flexbox & Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }} color="primary.main">
                Layout Configurator
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom variant="subtitle2">Number of Rows ({rowsCount})</Typography>
                <Slider
                  value={rowsCount}
                  onChange={(_, val) => setRowsCount(val as number)}
                  min={2}
                  max={15}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom variant="subtitle2">Seats Per Row ({colsCount})</Typography>
                <Slider
                  value={colsCount}
                  onChange={(_, val) => setColsCount(val as number)}
                  min={4}
                  max={24}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom variant="subtitle2">Premium / VIP Rows ({vipRows})</Typography>
                <Slider
                  value={vipRows}
                  onChange={(_, val) => setVipRows(val as number)}
                  min={0}
                  max={rowsCount}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom variant="subtitle2">Walkway Gap Interval ({gapInterval} cols)</Typography>
                <Slider
                  value={gapInterval}
                  onChange={(_, val) => setGapInterval(val as number)}
                  min={2}
                  max={10}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Refresh />}
                onClick={handleRebuild}
                sx={{ mb: 1 }}
              >
                Reset & Rebuild Layout
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }} color="primary.main">
                Row Pricing Configuration
              </Typography>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <TextField
                    label="Premium (₹)"
                    size="small"
                    type="number"
                    fullWidth
                    value={pricing.Premium}
                    onChange={(e) => setPricing({ ...pricing, Premium: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <TextField
                    label="Deluxe (₹)"
                    size="small"
                    type="number"
                    fullWidth
                    value={pricing.Deluxe}
                    onChange={(e) => setPricing({ ...pricing, Deluxe: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <TextField
                    label="Classic (₹)"
                    size="small"
                    type="number"
                    fullWidth
                    value={pricing.Classic}
                    onChange={(e) => setPricing({ ...pricing, Classic: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }} color="primary.main">
                Seat Brush Tool
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a tier, then click any seat in the grid preview to set/toggle its category on-the-fly.
              </Typography>
              <ToggleButtonGroup
                value={brushType}
                exclusive
                onChange={(_, val) => val && setBrushType(val)}
                fullWidth
                size="small"
                color="primary"
              >
                <ToggleButton value="Premium" sx={{ textTransform: "none" }}>
                  <Star fontSize="small" sx={{ mr: 0.5 }} /> Premium
                </ToggleButton>
                <ToggleButton value="Deluxe" sx={{ textTransform: "none" }}>
                  <EventSeat fontSize="small" sx={{ mr: 0.5 }} /> Deluxe
                </ToggleButton>
                <ToggleButton value="Classic" sx={{ textTransform: "none" }}>
                  <EventSeat fontSize="small" sx={{ mr: 0.5 }} /> Classic
                </ToggleButton>
                <ToggleButton value="Disabled" sx={{ textTransform: "none" }}>
                  <Block fontSize="small" sx={{ mr: 0.5 }} /> Gap/Blocked
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </div>

        {/* Live Canvas Preview Column */}
        <div className="lg:col-span-8">
          <Card sx={{ borderRadius: 2, boxShadow: 2, p: 3, minHeight: "500px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Interactive Seat Map Preview
              </Typography>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveLayout}
                sx={{ backgroundColor: "#222539", "&:hover": { backgroundColor: "#151724" } }}
              >
                Save Layout Template
              </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Screen Projection Indicator */}
            <Box
              sx={{
                width: "80%",
                height: "20px",
                margin: "0 auto 40px auto",
                backgroundColor: "action.disabledBackground",
                borderRadius: "0 0 40px 40px",
                borderBottom: "4px solid #F84464",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", letterSpacing: 3 }}>
                ALL EYES THIS WAY (THEATRE SCREEN)
              </Typography>
            </Box>

            {/* Seat Grid Rendering */}
            <Box
              sx={{
                overflowX: "auto",
                pb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              {Array.from({ length: rowsCount }).map((_, rIndex) => {
                const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
                const rowLetter = alphabet[rIndex] || `R${rIndex + 1}`;
                return (
                  <Box key={rowLetter} sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
                    {/* Row Label (Left) */}
                    <Typography sx={{ width: 24, fontWeight: "bold", textAlign: "center" }}>
                      {rowLetter}
                    </Typography>

                    {/* Seat items in row */}
                    {Array.from({ length: colsCount }).map((_, colIdx) => {
                      const colNum = colIdx + 1;
                      const seatId = `${rowLetter}${colNum}`;
                      const seat = seats.find((s) => s.id === seatId) || { id: seatId, type: "Classic" as const, price: 150 };
                      const isAfterGap = gapInterval > 0 && colNum % gapInterval === 0 && colNum !== colsCount;

                      // Color coding based on type
                      let bg = "grey.300";
                      let color = "text.primary";
                      if (seat.type === "Premium") {
                        bg = "amber.100";
                        color = "amber.900";
                      } else if (seat.type === "Deluxe") {
                        bg = "blue.100";
                        color = "blue.900";
                      } else if (seat.type === "Disabled") {
                        bg = "action.disabledBackground";
                        color = "text.disabled";
                      }

                      return (
                        <React.Fragment key={seatId}>
                          <Box
                            onClick={() => handleSeatClick(seatId)}
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: 1,
                              backgroundColor: bg,
                              color: color,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: seat.type === "Disabled" ? "transparent" : "divider",
                              transition: "all 0.2s",
                              "&:hover": {
                                transform: "scale(1.15)",
                                boxShadow: 1
                              }
                            }}
                            title={`Seat ${seatId} - ${seat.type} (₹${seat.price})`}
                          >
                            {seat.type === "Disabled" ? "" : colNum}
                          </Box>

                          {/* Gap spacer */}
                          {isAfterGap && <Box sx={{ width: 24 }} />}
                        </React.Fragment>
                      );
                    })}

                    {/* Row Label (Right) */}
                    <Typography sx={{ width: 24, fontWeight: "bold", textAlign: "center" }}>
                      {rowLetter}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Color Legend */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4, mb: 2, flexWrap: "wrap" }}>
              <Chip icon={<Star sx={{ color: "#b58105 !important" }} />} label="Premium Row (Front/VIP)" sx={{ backgroundColor: "#fef3c7" }} size="small" />
              <Chip icon={<EventSeat sx={{ color: "#1e3a8a !important" }} />} label="Deluxe Row (Middle)" sx={{ backgroundColor: "#dbeafe" }} size="small" />
              <Chip icon={<EventSeat sx={{ color: "#4b5563 !important" }} />} label="Classic Row (Rear)" sx={{ backgroundColor: "#f3f4f6" }} size="small" />
              <Chip icon={<Block />} label="Walkway / Gaps" sx={{ backgroundColor: "#e5e7eb" }} size="small" />
            </Box>

            {jsonOutput && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>Generated Configuration JSON:</Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fafafa", overflowX: "auto", maxHeight: "200px" }}>
                  <pre style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}>{jsonOutput}</pre>
                </Paper>
              </Box>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
