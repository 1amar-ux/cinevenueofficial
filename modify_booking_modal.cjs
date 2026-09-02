const fs = require('fs');
const path = 'src/components/BookingModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the fetch call and fallback logic in useEffect
const oldCalcStart = 'const fallbackCalc = FeeCalculationService.calculateBookingFees(';
const oldCalcEnd = 'setIsCalculating(false);\n      });';

// Need to safely remove this and replace with a cleaner fetch
content = content.replace(/const fallbackCalc = FeeCalculationService[\s\S]*setIsCalculating\(false\);\n      \}\);/m, 
`// Call server calculate-price endpoint for authoritative sync
    const tickets = selectedSeats.map(seat => ({ seatId: seat, price: getSeatPrice(seat) }));
    fetch("/api/booking/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showId: "show_123", // In a real app we'd pass the actual showId
        tickets
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Map backend format to frontend format for calculatedBreakdown
          setCalculatedBreakdown({
            totalAmount: data.data.total,
            ticketTotal: data.data.ticketSubtotal,
            taxTotal: data.data.ticketTax + data.data.convenienceFeeTax,
            convenienceFeeTotal: data.data.convenienceFee,
            totalTaxes: data.data.ticketTax + data.data.convenienceFeeTax,
            originalData: data.data
          });
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsCalculating(false);
      });`);

// Update payment creation logic
const oldPaymentStart = 'fetch("/api/bookings/lock"';
content = content.replace(/fetch\("\/api\/bookings\/lock"[\s\S]*?if \(!lockData\.success\) \{[\s\S]*?alert\("Failed to reserve seats: " \+ \(lockData\.message \|\| "Seat already taken"\)\);[\s\S]*?setIsLocking\(false\);[\s\S]*?return;[\s\S]*?\}/m, 
`fetch("/api/bookings/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: "show_123", // Mock show
          seats: selectedSeats,
          userId: userEmail || "user_guest"
        })
      });

      const lockRes = await lockResponse.json();
      if (!lockRes.success) {
        alert("Failed to reserve seats: " + (lockRes.message || "Seat already taken"));
        setIsLocking(false);
        return;
      }

      // 2. Create Payment Order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: "show_123",
          tickets: selectedSeats.map(seat => ({ seatId: seat, price: getSeatPrice(seat) }))
        })
      });
      const orderData = await orderResponse.json();
      if (!orderData.success) {
        alert("Failed to create payment order.");
        setIsLocking(false);
        return;
      }`);

fs.writeFileSync(path, content);
console.log('BookingModal updated');
