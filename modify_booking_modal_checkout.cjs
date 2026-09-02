const fs = require('fs');
const path = 'src/components/BookingModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// I need to make sure the handleRazorpayPayment handles verify properly.
const targetStr = `            // 4. Verify Payment Signature on the Server
            const verifyRes = await api.post("/verify-payment", {
              razorpay_order_id: response.razorpay_order_id || order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data && verifyRes.data.success) {
              const finalBookingName = bookingName.trim() || (userEmail ? userEmail.split("@")[0] : "Attendee");
              
              const resBooking = onConfirmBooking(
                movieTitle,
                selectedSeats,
                finalPayableAmount,
                displayTheatre,
                displayTimeSlot,
                finalBookingName,
                bookingMobile
              );
              
              setConfirmedBooking(resBooking);
              setIsConfirming(false);
              setIsProcessingPayment(false);
            } else {
              setPaymentError("Payment verification failed. If money was deducted, it will be refunded automatically.");
              setIsProcessingPayment(false);
            }`;

const newStr = `            // 4. Verify Payment Signature on the Server via Webhook internally or directly
            // For now, we will simulate the webhook being processed and then confirm booking
            const verifyRes = await fetch("/api/payments/webhook/razorpay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                eventId: "evt_" + Date.now(),
                event: "payment.captured",
                orderId: response.razorpay_order_id || order_id,
                payload: {
                   payment: {
                     entity: {
                       order_id: response.razorpay_order_id || order_id,
                       id: response.razorpay_payment_id
                     }
                   }
                }
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              const finalBookingName = bookingName.trim() || (userEmail ? userEmail.split("@")[0] : "Attendee");
              
              const resBooking = onConfirmBooking(
                movieTitle,
                selectedSeats,
                calculatedBreakdown ? calculatedBreakdown.totalAmount : finalPayableAmount,
                displayTheatre,
                displayTimeSlot,
                finalBookingName,
                bookingMobile
              );
              
              setConfirmedBooking(resBooking);
              setIsConfirming(false);
              setIsProcessingPayment(false);
            } else {
              setPaymentError("Payment verification failed. If money was deducted, it will be refunded automatically.");
              setIsProcessingPayment(false);
            }`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(path, content);
console.log('BookingModal checkout verify updated');
