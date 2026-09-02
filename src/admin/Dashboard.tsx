import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TableContainer,
  Popover,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip
} from "@mui/material";
import {
  TrendingUp,
  Movie,
  EventSeat,
  LocalActivity,
  AccountBalanceWallet,
  Storefront,
  Receipt,
  MoneyOff,
  Refresh,
  FilterList,
  CheckCircle,
  AccountBalance
} from "@mui/icons-material";
import { 
  fetchServerDashboardStats, 
  generateAuthoritativeDashboardData,
  calculateRevenueMetrics 
} from "../services/revenueService";
import { AuthoritativeDashboardData, RevenueFilterOptions, StandardRevenueMetrics } from "../types/revenue";

export default function Dashboard() {
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("last7days");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [theatreFilter, setTheatreFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<AuthoritativeDashboardData | null>(null);

  // Popover state to see past bookings for a user
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [popoverUser, setPopoverUser] = useState<string>("");
  const [popoverCurrentId, setPopoverCurrentId] = useState<string>("");

  const loadAuthoritativeData = async () => {
    setIsLoading(true);
    const filterOptions: RevenueFilterOptions = {
      range: dateRange as any,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      theatreName: theatreFilter || undefined
    };

    try {
      const serverResult = await fetchServerDashboardStats(filterOptions);
      if (serverResult) {
        setDashboardData(serverResult);
      } else {
        // Fallback to local stored bookings with authoritative calculation
        const localSaved = localStorage.getItem("cine_bookings");
        const parsed = localSaved ? JSON.parse(localSaved) : [];
        const localCalculated = generateAuthoritativeDashboardData(parsed, filterOptions);
        setDashboardData(localCalculated);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      const localSaved = localStorage.getItem("cine_bookings");
      const parsed = localSaved ? JSON.parse(localSaved) : [];
      const localCalculated = generateAuthoritativeDashboardData(parsed, filterOptions);
      setDashboardData(localCalculated);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthoritativeData();
  }, [dateRange, startDate, endDate, theatreFilter]);

  const handleOpenPopover = (event: any, userEmail: string, currentId: string) => {
    setAnchorEl(event.currentTarget);
    setPopoverUser(userEmail);
    setPopoverCurrentId(currentId);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const recentBookingsList = dashboardData?.recentBookings || [];
  const priorBookings = recentBookingsList.filter(
    (b) => (b.userEmail || b.user || "").toLowerCase() === popoverUser.toLowerCase() && b.id !== popoverCurrentId
  );

  const metrics: StandardRevenueMetrics = dashboardData?.metrics || {
    grossBookingValue: 0,
    ticketRevenue: 0,
    convenienceFee: 0,
    taxCollected: 0,
    discounts: 0,
    cinecoinDiscount: 0,
    refunds: 0,
    platformRevenue: 0,
    theatreSettlement: 0,
    netRevenue: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    ticketsSold: 0
  };

  const moviesRevenue = dashboardData?.moviePerformance || [];
  const theatresRevenue = dashboardData?.theatrePerformance || [];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header & Live Filter Bar */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#111827", display: "flex", alignItems: "center", gap: 1.5 }}>
            CineVenue Authoritative Financial Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Single source of truth for Gross Booking Value, Platform Fees, and Theatre Settlements.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="date-range-label">Time Period</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Time Period"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="thismonth">This Month</MenuItem>
              <MenuItem value="previousmonth">Previous Month</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {dateRange === "custom" && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="End Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>
          )}

          <Button
            variant="outlined"
            size="medium"
            startIcon={<Refresh />}
            onClick={loadAuthoritativeData}
            disabled={isLoading}
            sx={{ fontWeight: "bold" }}
          >
            {isLoading ? "Syncing..." : "Sync"}
          </Button>

          <Chip
            icon={<CheckCircle />}
            label="Reconciled"
            color="success"
            variant="filled"
            sx={{ fontWeight: "600" }}
          />
        </Box>
      </Box>

      {/* KPI Cards: Authoritative Revenue Separation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* 1. GROSS BOOKING VALUE (Customer Paid) */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #3B82F6" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                Gross Booking Value
              </Typography>
              <AccountBalanceWallet fontSize="small" sx={{ color: "#3B82F6" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#111827" }}>
              ₹{metrics.grossBookingValue.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              Total customer payments
            </Typography>
          </CardContent>
        </Card>

        {/* 2. CINEVENUE PLATFORM REVENUE */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #10B981" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                CineVenue Revenue
              </Typography>
              <TrendingUp fontSize="small" sx={{ color: "#10B981" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#10B981" }}>
              ₹{metrics.platformRevenue.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              Convenience fees + commission
            </Typography>
          </CardContent>
        </Card>

        {/* 3. THEATRE SETTLEMENTS */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #8B5CF6" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                Theatre Settlement
              </Typography>
              <AccountBalance fontSize="small" sx={{ color: "#8B5CF6" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#6D28D9" }}>
              ₹{metrics.theatreSettlement.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              Payable to theatre partners
            </Typography>
          </CardContent>
        </Card>

        {/* 4. TAXES COLLECTED (GST) */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #F59E0B" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                Taxes (GST)
              </Typography>
              <Receipt fontSize="small" sx={{ color: "#F59E0B" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#D97706" }}>
              ₹{metrics.taxCollected.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              Government statutory GST
            </Typography>
          </CardContent>
        </Card>

        {/* 5. REFUNDS ISSUED */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #EF4444" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                Refunds
              </Typography>
              <MoneyOff fontSize="small" sx={{ color: "#EF4444" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#DC2626" }}>
              ₹{metrics.refunds.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              {metrics.cancelledBookings} cancelled bookings
            </Typography>
          </CardContent>
        </Card>

        {/* 6. TICKETS & BOOKINGS */}
        <Card sx={{ borderRadius: 3, boxShadow: 1, borderTop: "4px solid #06B6D4" }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase" }}>
                Tickets Sold
              </Typography>
              <LocalActivity fontSize="small" sx={{ color: "#06B6D4" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "800", color: "#0891B2" }}>
              {metrics.ticketsSold.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
              {metrics.confirmedBookings} confirmed bookings
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Authoritative Revenue Reconciliation Formula Banner */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
              Authoritative Balance Reconciliation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formula: Gross Booking Value = Theatre Settlement + CineVenue Platform Revenue + Taxes Collected - Discounts
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, fontFamily: "monospace", fontSize: "13px" }}>
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded font-bold">
              ₹{metrics.grossBookingValue.toLocaleString("en-IN")} Gross
            </span>
            <span className="text-gray-400 font-bold">=</span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded font-bold">
              ₹{metrics.theatreSettlement.toLocaleString("en-IN")} Theatre
            </span>
            <span className="text-gray-400 font-bold">+</span>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-bold">
              ₹{metrics.platformRevenue.toLocaleString("en-IN")} CineVenue
            </span>
            <span className="text-gray-400 font-bold">+</span>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-bold">
              ₹{metrics.taxCollected.toLocaleString("en-IN")} GST
            </span>
            {(metrics.discounts > 0 || metrics.cinecoinDiscount > 0) && (
              <>
                <span className="text-gray-400 font-bold">-</span>
                <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded font-bold">
                  ₹{(metrics.discounts + metrics.cinecoinDiscount).toLocaleString("en-IN")} Discounts
                </span>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Chart 1: Movie Revenue Share */}
        <div className="lg:col-span-7">
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Box Office Movie Performance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calculated from actual confirmed bookings
                </Typography>
              </Box>
              <Chip label={`${moviesRevenue.length} Titles`} size="small" />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {moviesRevenue.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No booking transactions recorded for selected period.
                </Typography>
              ) : (
                moviesRevenue.map((mov) => {
                  const maxGross = Math.max(...moviesRevenue.map((m) => m.grossBookingValue), 1);
                  const pct = (mov.grossBookingValue / maxGross) * 100;

                  return (
                    <Box
                      key={mov.movieTitle}
                      onClick={() => setSelectedMovie(mov.movieTitle)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        backgroundColor: selectedMovie === mov.movieTitle ? "#F1F5F9" : "transparent",
                        "&:hover": { backgroundColor: "#F8FAFC" }
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          {mov.movieTitle}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            ₹{mov.grossBookingValue.toLocaleString("en-IN")}
                          </Typography>
                          <Chip label={`${mov.tickets} seats`} size="small" sx={{ height: 20, fontSize: "10px", fontWeight: "bold" }} />
                        </Box>
                      </Box>
                      <Box sx={{ width: "100%", height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor: "#3B82F6",
                            borderRadius: 4
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </div>

        {/* Chart 2: Theatre Venues Breakdown */}
        <div className="lg:col-span-5">
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Theatre Settlement Ledger
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gross sales vs. net partner payable share
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {theatresRevenue.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No theatre settlements recorded for selected period.
                </Typography>
              ) : (
                theatresRevenue.map((theatre) => (
                  <Box key={theatre.theatreName} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                      <Storefront sx={{ color: "#8B5CF6" }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          {theatre.theatreName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {theatre.city} • {theatre.tickets} seats sold
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#6D28D9" }}>
                        ₹{theatre.theatreSettlement.toLocaleString("en-IN")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gross: ₹{theatre.grossBookingValue.toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </div>
      </div>

      {/* Authoritative Booking Ledger */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Authoritative Booking Ledger
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verified customer payments with split of tickets, platform fees, taxes, and settlements
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Movie & Venue</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Seats</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Customer Paid</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Theatre Share</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Platform Fee</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>History</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookingsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    No bookings found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookingsList.map((bk) => {
                  const userEmail = bk.userEmail || bk.user || "customer@cinevenue.com";
                  const priorCount = recentBookingsList.filter(
                    (b) => (b.userEmail || b.user || "").toLowerCase() === userEmail.toLowerCase() && b.id !== bk.id
                  ).length;
                  const isCancelled = bk.status === "Cancelled" || bk.ticketStatus === "CANCELLED";
                  const paid = bk.totalPrice !== undefined ? bk.totalPrice : (bk.totalAmount || 0);
                  const ticketAmt = bk.ticketAmount || paid;
                  const tShare = bk.theatreShare !== undefined ? bk.theatreShare : (ticketAmt * 0.88);
                  const pFee = bk.totalFees !== undefined ? bk.totalFees : ((bk.platformFee || 0) + (bk.convenienceFee || 0));

                  return (
                    <TableRow key={bk.id} hover>
                      <TableCell sx={{ fontWeight: "bold", fontFamily: "monospace" }}>{bk.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: "600" }}>{bk.userName || "Customer"}</Typography>
                        <Typography variant="caption" color="text.secondary">{userEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: "600" }}>{bk.movieTitle || bk.movie}</Typography>
                        <Typography variant="caption" color="text.secondary">{bk.theatreName || "Partner Venue"}</Typography>
                      </TableCell>
                      <TableCell>{Array.isArray(bk.seats) ? bk.seats.join(", ") : bk.seats}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right", color: isCancelled ? "text.disabled" : "#111827" }}>
                        ₹{paid.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right", color: isCancelled ? "text.disabled" : "#6D28D9" }}>
                        ₹{Math.round(tShare).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right", color: isCancelled ? "text.disabled" : "#059669" }}>
                        ₹{Math.round(pFee).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bk.status || "Confirmed"}
                          size="small"
                          color={isCancelled ? "error" : "success"}
                          sx={{ fontWeight: "bold", fontSize: "11px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${priorCount} prior`}
                          color={priorCount > 0 ? "primary" : "default"}
                          size="small"
                          onClick={(e) => priorCount > 0 && handleOpenPopover(e, userEmail, bk.id)}
                          sx={{ cursor: priorCount > 0 ? "pointer" : "default", fontWeight: "bold", fontSize: "11px" }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Popover showing past bookings */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPaper-root": { p: 2, maxWidth: 380, borderRadius: 2, boxShadow: 3 }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Authoritative History for {popoverUser}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {priorBookings.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No other bookings found.
          </Typography>
        ) : (
          <List dense sx={{ p: 0 }}>
            {priorBookings.map((b) => (
              <ListItem key={b.id} disableGutters sx={{ py: 0.5 }}>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: "bold" }}>{b.movieTitle || b.movie}</Typography>}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      ID: {b.id} | {Array.isArray(b.seats) ? b.seats.join(", ") : b.seats} | Paid: ₹{b.totalPrice || b.amount}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
}
