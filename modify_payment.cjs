const fs = require('fs');
const path = 'src/components/BookingModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `const orderRes = await api.post("/create-order", {
        amount: Math.round(finalPayableAmount * 100), // Amount in paise
        currency: "INR",
        receipt: \`cine_rcpt_\${Date.now()}\`
      });

      if (!orderRes.data || !orderRes.data.success || !orderRes.data.order_id) {
        throw new Error(orderRes.data?.message || "Unable to initiate Razorpay checkout order.");
      }

      const { order_id, key_id } = orderRes.data;`;

const newStr = `const tickets = selectedSeats.map(seat => ({ seatId: seat, price: getSeatPrice(seat) }));
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: "show_123", // Mock
          tickets
        })
      });
      const orderData = await orderRes.json();

      if (!orderData || !orderData.success || !orderData.data.orderId) {
        throw new Error(orderData?.message || "Unable to initiate checkout order.");
      }

      const order_id = orderData.data.orderId;
      const key_id = "rzp_test_mock"; // We'll mock the razorpay key
      `;

content = content.replace(targetStr, newStr);

fs.writeFileSync(path, content);
console.log('Payment checkout updated');
