const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");
const EventBooking = require("../models/EventBooking");
const EventTicket = require("../models/EventTicket");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

// 1. GET /api/v1/events
exports.getEvents = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 20 } = req.query;

    const query = { status: "PUBLISHED" };
    if (city) query["venue.city"] = new RegExp(`^${city}$`, "i");
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/v1/events/:eventId (supports ID or slug)
exports.getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
    const query = isObjectId ? { $or: [{ _id: eventId }, { slug: eventId }] } : { slug: eventId };

    const event = await Event.findOne(query).populate("ticketTypes.typeId");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/v1/events/:eventId/tickets (Get authoritative ticket types and capacity)
exports.getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(eventId);
    const event = await Event.findOne(isObjectId ? { $or: [{ _id: eventId }, { slug: eventId }] } : { slug: eventId });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const ticketTypes = await EventTicketType.find({
      eventId: event._id,
      status: { $in: ["ACTIVE", "SOLD_OUT"] },
    }).sort({ price: 1 });

    const formattedTypes = ticketTypes.map((t) => ({
      _id: t._id,
      name: t.name,
      description: t.description,
      price: t.price,
      totalQuantity: t.totalQuantity,
      availableQuantity: t.availableQuantity,
      soldQuantity: t.soldQuantity,
      reservedQuantity: t.reservedQuantity,
      maxPerBooking: t.maxPerBooking,
      minPerBooking: t.minPerBooking,
      status: t.availableQuantity <= 0 ? "SOLD_OUT" : t.status,
    }));

    res.json({
      success: true,
      eventId: event._id,
      eventBookingStatus: event.availableTicketCount <= 0 ? "SOLD_OUT" : event.bookingStatus,
      totalCapacity: event.totalTicketCapacity,
      availableCapacity: event.availableTicketCount,
      soldCapacity: event.soldTicketCount,
      freePassesIssued: event.freePassesIssuedCount || 0,
      maxTicketsPerBooking: event.maxTicketsPerBooking,
      minTicketsPerBooking: event.minTicketsPerBooking,
      count: formattedTypes.length,
      ticketTypes: formattedTypes,
      freePassCategories: (event.freePassCategories || []).filter((c) => c.status !== "DISABLED"),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. POST /api/v1/admin/events (Admin create event with capacity & limits)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      banner,
      venue,
      date,
      startTime,
      endTime,
      termsAndConditions,
      ticketTypes,
      totalTicketCapacity = 1000,
      maxTicketsPerBooking = 10,
      minTicketsPerBooking = 1,
      bookingStartDate,
      bookingEndDate,
      allowOverbooking = false,
      freePassCategories = [],
    } = req.body;

    if (!title || !venue || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "title, venue, date, and startTime are required",
      });
    }

    const totalCapacity = Number(totalTicketCapacity) || 1000;

    // Validate allocated sum if overbooking is disabled
    let paidAllocation = 0;
    if (Array.isArray(ticketTypes)) {
      paidAllocation = ticketTypes.reduce(
        (sum, t) => sum + (Number(t.totalQuantity) || Number(t.availableQuantity) || 0),
        0
      );
    }

    let freeAllocation = 0;
    if (Array.isArray(freePassCategories)) {
      freeAllocation = freePassCategories.reduce(
        (sum, c) => sum + (Number(c.allocatedCapacity) || 0),
        0
      );
    }

    if (!allowOverbooking && paidAllocation + freeAllocation > totalCapacity) {
      return res.status(400).json({
        success: false,
        message: `Total allocated capacity (${paidAllocation + freeAllocation}) exceeds event's total ticket capacity (${totalCapacity}). Enable 'Allow Overbooking' or adjust category limits.`,
      });
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Format free pass categories with generated IDs
    const formattedFreePassCategories = Array.isArray(freePassCategories)
      ? freePassCategories.map((c, idx) => ({
          categoryId: c.categoryId || `FPC-${idx + 1}-${Date.now().toString().slice(-4)}`,
          name: c.name,
          description: c.description || "",
          allocatedCapacity: Number(c.allocatedCapacity) || 50,
          issuedCount: 0,
          maxPerPerson: Number(c.maxPerPerson) || 2,
          maxPerOrganisation: Number(c.maxPerOrganisation) || 5,
          approvalRequired: !!c.approvalRequired,
          emailDeliveryEnabled: c.emailDeliveryEnabled !== false,
          entryRules: c.entryRules || [],
          status: "ACTIVE",
        }))
      : [];

    const event = await Event.create({
      title,
      slug,
      description,
      poster,
      banner,
      organizerId: req.user?.id || null,
      venue,
      date: new Date(date),
      startTime,
      endTime,
      status: "PUBLISHED",
      bookingStatus: "OPEN",
      totalTicketCapacity: totalCapacity,
      soldTicketCount: 0,
      freePassesIssuedCount: 0,
      reservedTicketCount: 0,
      availableTicketCount: totalCapacity,
      maxTicketsPerBooking: Number(maxTicketsPerBooking) || 10,
      minTicketsPerBooking: Number(minTicketsPerBooking) || 1,
      bookingStartDate: bookingStartDate ? new Date(bookingStartDate) : null,
      bookingEndDate: bookingEndDate ? new Date(bookingEndDate) : null,
      allowOverbooking: !!allowOverbooking,
      freePassCategories: formattedFreePassCategories,
      termsAndConditions: termsAndConditions || undefined,
    });

    if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      const createdTypes = [];
      for (const tt of ticketTypes) {
        const qty = Number(tt.totalQuantity) || Number(tt.availableQuantity) || 100;
        const typeDoc = await EventTicketType.create({
          eventId: event._id,
          name: tt.name,
          description: tt.description || "",
          price: Number(tt.price) || 0,
          totalQuantity: qty,
          availableQuantity: qty,
          soldQuantity: 0,
          reservedQuantity: 0,
          maxPerBooking: Number(tt.maxPerBooking) || 10,
          minPerBooking: Number(tt.minPerBooking) || 1,
          status: "ACTIVE",
        });
        createdTypes.push({ typeId: typeDoc._id });
      }
      event.ticketTypes = createdTypes;
      await event.save();
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. PATCH /api/v1/admin/events/:eventId (Admin update event)
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(eventId, req.body, { new: true });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET /api/v1/admin/events/:eventId/capacity (Authoritative Capacity Dashboard)
exports.getEventCapacity = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const ticketTypes = await EventTicketType.find({ eventId: event._id });
    const tickets = await EventTicket.find({ eventId: event._id });

    const cancelledCount = tickets.filter((t) => t.status === "CANCELLED").length;
    const refundedCount = tickets.filter((t) => t.status === "REFUNDED").length;
    const usedCount = tickets.filter((t) => t.status === "USED").length;

    const totalSold = event.soldTicketCount || 0;
    const freeIssued = event.freePassesIssuedCount || 0;
    const totalCommitted = totalSold + freeIssued;
    const percentageSold = event.totalTicketCapacity > 0
      ? Math.min(100, Math.round((totalCommitted / event.totalTicketCapacity) * 100))
      : 0;

    const ticketTypeBreakdown = ticketTypes.map((tt) => {
      const remaining = tt.availableQuantity;
      const typePct = tt.totalQuantity > 0 ? Math.min(100, Math.round((tt.soldQuantity / tt.totalQuantity) * 100)) : 0;
      return {
        ticketTypeId: tt._id,
        name: tt.name,
        price: tt.price,
        totalQuantity: tt.totalQuantity,
        soldQuantity: tt.soldQuantity,
        reservedQuantity: tt.reservedQuantity,
        availableQuantity: remaining,
        percentageSold: typePct,
        maxPerBooking: tt.maxPerBooking,
        status: remaining <= 0 ? "SOLD_OUT" : tt.status,
      };
    });

    const freePassBreakdown = (event.freePassCategories || []).map((cat) => {
      const remaining = Math.max(0, cat.allocatedCapacity - (cat.issuedCount || 0));
      const catPct = cat.allocatedCapacity > 0 ? Math.min(100, Math.round(((cat.issuedCount || 0) / cat.allocatedCapacity) * 100)) : 0;
      return {
        categoryId: cat.categoryId,
        name: cat.name,
        allocated: cat.allocatedCapacity,
        issued: cat.issuedCount || 0,
        remaining,
        percentageIssued: catPct,
        maxPerPerson: cat.maxPerPerson,
        maxPerOrganisation: cat.maxPerOrganisation,
        approvalRequired: cat.approvalRequired,
        status: remaining <= 0 ? "EXHAUSTED" : cat.status,
      };
    });

    res.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        bookingStatus: event.availableTicketCount <= 0 ? "SOLD_OUT" : event.bookingStatus,
      },
      capacity: {
        totalCapacity: event.totalTicketCapacity,
        paidSold: totalSold,
        freePassesIssued: freeIssued,
        totalCommitted,
        reserved: event.reservedTicketCount || 0,
        available: event.availableTicketCount,
        cancelled: cancelledCount,
        refunded: refundedCount,
        checkedIn: usedCount,
        percentageSold,
        isSoldOut: event.availableTicketCount <= 0 || event.bookingStatus === "SOLD_OUT",
      },
      controls: {
        maxTicketsPerBooking: event.maxTicketsPerBooking,
        minTicketsPerBooking: event.minTicketsPerBooking,
        bookingStartDate: event.bookingStartDate,
        bookingEndDate: event.bookingEndDate,
        allowOverbooking: event.allowOverbooking,
      },
      ticketTypes: ticketTypeBreakdown,
      freePassCategories: freePassBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. PATCH /api/v1/admin/events/:eventId/capacity (Update capacity configuration)
exports.updateEventCapacity = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      totalTicketCapacity,
      maxTicketsPerBooking,
      minTicketsPerBooking,
      bookingStartDate,
      bookingEndDate,
      allowOverbooking,
      bookingStatus,
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (totalTicketCapacity !== undefined) {
      const newCapacity = Number(totalTicketCapacity);
      if (newCapacity < 1) {
        return res.status(400).json({ success: false, message: "totalTicketCapacity must be at least 1" });
      }
      const committed = (event.soldTicketCount || 0) + (event.freePassesIssuedCount || 0) + (event.reservedTicketCount || 0);
      if (newCapacity < committed && !allowOverbooking && !event.allowOverbooking) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total capacity to ${newCapacity}: already committed ${committed} tickets/passes`,
        });
      }
      event.totalTicketCapacity = newCapacity;
      event.availableTicketCount = Math.max(0, newCapacity - committed);
    }

    if (maxTicketsPerBooking !== undefined) event.maxTicketsPerBooking = Number(maxTicketsPerBooking);
    if (minTicketsPerBooking !== undefined) event.minTicketsPerBooking = Number(minTicketsPerBooking);
    if (bookingStartDate !== undefined) event.bookingStartDate = bookingStartDate ? new Date(bookingStartDate) : null;
    if (bookingEndDate !== undefined) event.bookingEndDate = bookingEndDate ? new Date(bookingEndDate) : null;
    if (allowOverbooking !== undefined) event.allowOverbooking = !!allowOverbooking;
    if (bookingStatus !== undefined) event.bookingStatus = bookingStatus;

    // Check sold out
    if (event.availableTicketCount <= 0) {
      event.bookingStatus = "SOLD_OUT";
    } else if (event.bookingStatus === "SOLD_OUT" && event.availableTicketCount > 0) {
      event.bookingStatus = "OPEN";
    }

    await event.save();

    res.json({
      success: true,
      message: "Event capacity settings updated successfully",
      capacity: {
        totalTicketCapacity: event.totalTicketCapacity,
        availableTicketCount: event.availableTicketCount,
        soldTicketCount: event.soldTicketCount,
        freePassesIssuedCount: event.freePassesIssuedCount,
        reservedTicketCount: event.reservedTicketCount,
        bookingStatus: event.bookingStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. PATCH /api/v1/admin/events/:eventId/ticket-types/:ticketTypeId (Update ticket type capacity)
exports.updateTicketType = async (req, res) => {
  try {
    const { ticketTypeId } = req.params;
    const { name, price, totalQuantity, maxPerBooking, minPerBooking, status } = req.body;

    const ticketType = await EventTicketType.findById(ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ success: false, message: "Ticket category not found" });
    }

    if (name !== undefined) ticketType.name = name;
    if (price !== undefined) ticketType.price = Number(price);
    if (maxPerBooking !== undefined) ticketType.maxPerBooking = Number(maxPerBooking);
    if (minPerBooking !== undefined) ticketType.minPerBooking = Number(minPerBooking);
    if (status !== undefined) ticketType.status = status;

    if (totalQuantity !== undefined) {
      const newTotal = Number(totalQuantity);
      const committed = (ticketType.soldQuantity || 0) + (ticketType.reservedQuantity || 0);
      ticketType.totalQuantity = newTotal;
      ticketType.availableQuantity = Math.max(0, newTotal - committed);
      if (ticketType.availableQuantity <= 0) {
        ticketType.status = "SOLD_OUT";
      } else if (ticketType.status === "SOLD_OUT" && ticketType.availableQuantity > 0) {
        ticketType.status = "ACTIVE";
      }
    }

    await ticketType.save();

    res.json({
      success: true,
      message: "Ticket category updated successfully",
      ticketType,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. GET /api/v1/admin/events/:eventId/ticket-sales (Detailed Sales Report)
exports.getEventTicketSales = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const bookings = await EventBooking.find({ eventId, status: "CONFIRMED" });
    const grossRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
    const bookingFeeRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.bookingFee || 0), 0);
    const totalPaidTickets = bookings
      .filter((b) => b.bookingType !== "FREE_PASS")
      .reduce((sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0), 0);

    res.json({
      success: true,
      eventId: event._id,
      eventTitle: event.title,
      summary: {
        totalRevenue: grossRevenue,
        bookingFeeRevenue,
        totalPaidTickets,
        freePassesIssued: event.freePassesIssuedCount || 0,
        confirmedBookingsCount: bookings.length,
      },
      recentBookings: bookings.slice(0, 50),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. POST /api/v1/admin/events/:eventId/publish
exports.publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "PUBLISHED", bookingStatus: "OPEN" },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event published successfully", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. POST /api/v1/admin/events/:eventId/close-booking
exports.closeBooking = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { bookingStatus: "CLOSED" },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event booking closed", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
