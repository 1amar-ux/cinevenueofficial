async function testApi() {
  console.log("Testing POST http://localhost:3000/api/events/send-pass-email...");
  const res = await fetch("http://localhost:3000/api/events/send-pass-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "amarnathgattem@gmail.com",
      passId: "CV-API-TEST-1001",
      eventTitle: "API Route Validation Pass",
      attendeeName: "Amarnath",
      venueName: "Hyderabad Arena",
      date: "2026-10-25",
      time: "07:00 PM",
      tier: "GOLD PASS",
      totalPrice: 0,
      isFree: true
    })
  });

  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Event Pass Response:", json);

  console.log("\nTesting POST http://localhost:3000/api/v1/notifications/send-ticket-email (Movie Ticket)...");
  const movieTicketRes = await fetch("http://localhost:3000/api/v1/notifications/send-ticket-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "amarnathgattem@gmail.com",
      name: "Amarnath",
      bookingId: "BK-CINE-88219",
      ticketCode: "TC-88219",
      title: "Kalki 2898 AD",
      venue: "CineVenue IMAX Screen 1",
      date: "2026-10-20",
      time: "09:30 PM",
      seats: "F12, F13",
      category: "Recliner Gold",
      quantity: 2,
      ticketUrl: "http://localhost:3000/ticket/BK-CINE-88219",
      type: "MOVIE"
    })
  });
  const movieJson = await movieTicketRes.json();
  console.log("Movie Ticket Status:", movieTicketRes.status);
  console.log("Movie Ticket Response:", movieJson);
}

testApi();
