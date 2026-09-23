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

function formatEventResponse(event) {
  if (!event) return null;
  const doc = event.toObject ? event.toObject() : { ...event };
  const posterUrl =
    typeof doc.poster === "object" && doc.poster && doc.poster.url
      ? doc.poster.url
      : typeof doc.poster === "string"
      ? doc.poster
      : "";

  const bannerUrl =
    typeof doc.banner === "object" && doc.banner && doc.banner.url
      ? doc.banner.url
      : typeof doc.banner === "string"
      ? doc.banner
      : posterUrl;

  let minPrice = doc.eventType === "FREE" ? 0 : 499;
  if (Array.isArray(doc.ticketTypes) && doc.ticketTypes.length > 0) {
    const prices = doc.ticketTypes
      .map((t) => (t.typeId && typeof t.typeId.price === "number" ? t.typeId.price : (typeof t.price === "number" ? t.price : null)))
      .filter((p) => p !== null);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
    }
  }

  return {
    ...doc,
    id: doc._id ? doc._id.toString() : doc.id,
    _id: doc._id,
    poster: typeof doc.poster === "object" && doc.poster ? doc.poster : { url: posterUrl, publicId: "", alt: `${doc.title || "Event"} poster` },
    banner: typeof doc.banner === "object" && doc.banner ? doc.banner : { url: bannerUrl, publicId: "", alt: `${doc.title || "Event"} banner` },
    posterUrl,
    bannerUrl,
    venueName: doc.venue?.name || "",
    venueAddress: doc.venue?.address || "",
    city: doc.venue?.city || "",
    state: doc.venue?.state || "",
    time: doc.startTime || "",
    minPrice,
    isPaid: doc.eventType === "PAID" && minPrice > 0,
    isFree: doc.eventType === "FREE" || doc.passMode === "FREE" || minPrice === 0,
  };
}

// 1. GET /api/v1/events
exports.getEvents = async (req, res) => {
  try {
    const { city, category, eventType, passMode, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status.toUpperCase();
    } else {
      // By default, public query exposes published, upcoming, and ongoing events
      query.status = { $in: ["PUBLISHED", "UPCOMING", "ONGOING"] };
    }

    if (eventType) {
      query.eventType = eventType.toUpperCase();
    }
    if (passMode) {
      query.passMode = passMode.toUpperCase();
    }
    if (category && category.toUpperCase() !== "ALL") {
      query.category = new RegExp(`^${category.replace(/_/g, " ")}$`, "i");
    }
    if (city && city.toUpperCase() !== "ALL") {
      query["venue.city"] = new RegExp(`^${city}$`, "i");
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
        { "venue.city": { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Event.countDocuments(query);
    const formattedEvents = events.map(formatEventResponse);

    res.json({
      success: true,
      count: formattedEvents.length,
      total,
      events: formattedEvents,
      data: {
        events: formattedEvents,
        total,
      },
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

    const formatted = formatEventResponse(event);
    res.json({
      success: true,
      event: formatted,
      data: { event: formatted },
    });
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
      category = "Concerts",
      eventType = "PAID",
      passMode = "PAID",
      poster,
      banner,
      venue,
      venueName,
      venueAddress,
      city,
      state,
      pincode,
      date,
      startTime,
      endTime,
      status = "PUBLISHED",
      bookingStatus = "OPEN",
      termsAndConditions,
      ticketTypes = [],
      totalTicketCapacity = 1000,
      maxTicketsPerBooking = 10,
      minTicketsPerBooking = 1,
      bookingStartDate,
      bookingEndDate,
      allowOverbooking = false,
      freePassCategories = [],
      organizerContact,
    } = req.body;

    if (!title || (!venue && !venueName) || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "title, venue/venueName, date, and startTime are required",
      });
    }

    // Normalize venue
    let normalizedVenue = {};
    if (typeof venue === "string") {
      normalizedVenue = {
        name: venue,
        address: venueAddress || venue,
        city: city || "Hyderabad",
        state: state || "",
        pincode: pincode || "",
      };
    } else if (venue && typeof venue === "object") {
      normalizedVenue = {
        name: venue.name || venue.venueName || venueName || "Venue",
        address: venue.address || venue.venueAddress || venueAddress || "",
        city: venue.city || city || "Hyderabad",
        state: venue.state || state || "",
        pincode: venue.pincode || pincode || "",
      };
    } else {
      normalizedVenue = {
        name: venueName || "Venue",
        address: venueAddress || "",
        city: city || "Hyderabad",
        state: state || "",
        pincode: pincode || "",
      };
    }

    // Normalize poster and banner
    let normalizedPoster = { url: "", publicId: "", alt: `${title} poster` };
    if (typeof poster === "string" && poster) {
      normalizedPoster = { url: poster, publicId: "", alt: `${title} poster` };
    } else if (typeof poster === "object" && poster) {
      normalizedPoster = {
        url: poster.url || "",
        publicId: poster.publicId || "",
        alt: poster.alt || `${title} poster`,
      };
    }

    let normalizedBanner = { url: "", publicId: "", alt: `${title} banner` };
    if (typeof banner === "string" && banner) {
      normalizedBanner = { url: banner, publicId: "", alt: `${title} banner` };
    } else if (typeof banner === "object" && banner) {
      normalizedBanner = {
        url: banner.url || normalizedPoster.url || "",
        publicId: banner.publicId || "",
        alt: banner.alt || `${title} banner`,
      };
    } else {
      normalizedBanner = { ...normalizedPoster, alt: `${title} banner` };
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

    const normStatus = (status || "PUBLISHED").toUpperCase();
    const event = await Event.create({
      title,
      slug,
      description: description || "",
      category: category || "Concerts",
      eventType: (eventType || "PAID").toUpperCase(),
      passMode: (passMode || "PAID").toUpperCase(),
      poster: normalizedPoster,
      banner: normalizedBanner,
      organizerId: req.user?.id || null,
      organizerContact: organizerContact || undefined,
      venue: normalizedVenue,
      date: new Date(date),
      startTime,
      endTime: endTime || "",
      status: normStatus,
      bookingStatus: (bookingStatus || "OPEN").toUpperCase(),
      publishedAt: normStatus === "PUBLISHED" ? new Date() : null,
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
        const price = eventType === "FREE" ? 0 : Number(tt.price) || 0;
        const typeDoc = await EventTicketType.create({
          eventId: event._id,
          name: tt.name,
          description: tt.description || "",
          price,
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

    const populated = await Event.findById(event._id).populate("ticketTypes.typeId");
    const formatted = formatEventResponse(populated);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. PATCH /api/v1/admin/events/:eventId (Admin update event)
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = { ...req.body };

    // If venue is sent as flat fields or string, normalize it
    if (updateData.venueName || updateData.venueAddress || updateData.city) {
      updateData.venue = {
        name: updateData.venueName || updateData.venue?.name || "Venue",
        address: updateData.venueAddress || updateData.venue?.address || "",
        city: updateData.city || updateData.venue?.city || "Hyderabad",
        state: updateData.state || updateData.venue?.state || "",
        pincode: updateData.pincode || updateData.venue?.pincode || "",
      };
    }

    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
      if (updateData.status === "PUBLISHED" && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (updateData.bookingStatus) {
      updateData.bookingStatus = updateData.bookingStatus.toUpperCase();
    }

    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true }).populate("ticketTypes.typeId");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      event: formatEventResponse(event),
    });
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
      { status: "PUBLISHED", bookingStatus: "OPEN", publishedAt: new Date() },
      { new: true }
    ).populate("ticketTypes.typeId");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event published successfully", event: formatEventResponse(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. POST /api/v1/admin/events/:eventId/unpublish
exports.unpublishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "DRAFT", bookingStatus: "NOT_OPEN" },
      { new: true }
    ).populate("ticketTypes.typeId");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event unpublished and saved as draft", event: formatEventResponse(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. PATCH /api/v1/admin/events/:eventId/status
exports.changeEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, bookingStatus } = req.body;
    const update = {};
    if (status) update.status = status.toUpperCase();
    if (bookingStatus) update.bookingStatus = bookingStatus.toUpperCase();
    if (status && status.toUpperCase() === "PUBLISHED") update.publishedAt = new Date();

    const event = await Event.findByIdAndUpdate(eventId, update, { new: true }).populate("ticketTypes.typeId");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: `Event status updated to ${event.status}`, event: formatEventResponse(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. POST /api/v1/admin/events/:eventId/cancel
exports.cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "CANCELLED", bookingStatus: "CLOSED" },
      { new: true }
    ).populate("ticketTypes.typeId");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event cancelled", event: formatEventResponse(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. DELETE /api/v1/admin/events/:eventId
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Ensure safe delete: no confirmed bookings
    const confirmedCount = await EventBooking.countDocuments({
      eventId: event._id,
      status: "CONFIRMED",
    });

    if (confirmedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with ${confirmedCount} confirmed bookings. Please cancel the event instead.`,
      });
    }

    await EventTicketType.deleteMany({ eventId: event._id });
    await Event.findByIdAndDelete(eventId);

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. POST /api/v1/admin/events/:eventId/close-booking
exports.closeBooking = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { bookingStatus: "CLOSED" },
      { new: true }
    ).populate("ticketTypes.typeId");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event booking closed", event: formatEventResponse(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16. GET /api/v1/admin/events (Authoritative Admin Event List)
exports.adminGetEvents = async (req, res) => {
  try {
    const { status, eventType, passMode, category, search, city, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== "ALL") {
      query.status = status.toUpperCase();
    }
    if (eventType && eventType !== "ALL") {
      query.eventType = eventType.toUpperCase();
    }
    if (passMode && passMode !== "ALL") {
      query.passMode = passMode.toUpperCase();
    }
    if (category && category !== "ALL") {
      query.category = new RegExp(`^${category}$`, "i");
    }
    if (city && city !== "ALL") {
      query["venue.city"] = new RegExp(`^${city}$`, "i");
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
        { "venue.city": { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Event.countDocuments(query);
    const formatted = events.map(formatEventResponse);

    res.json({
      success: true,
      count: formatted.length,
      total,
      events: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17. GET /api/v1/events/upcoming
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const query = {
      status: { $in: ["UPCOMING", "PUBLISHED"] },
      date: { $gte: today },
    };
    if (req.query.city && req.query.city !== "ALL") query["venue.city"] = new RegExp(`^${req.query.city}$`, "i");
    if (req.query.category && req.query.category !== "ALL") query.category = new RegExp(`^${req.query.category}$`, "i");

    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1 });
    const formatted = events.map(formatEventResponse);
    res.json({ success: true, count: formatted.length, events: formatted, data: { events: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18. GET /api/v1/events/ongoing
exports.getOngoingEvents = async (req, res) => {
  try {
    const query = { status: "ONGOING" };
    if (req.query.city && req.query.city !== "ALL") query["venue.city"] = new RegExp(`^${req.query.city}$`, "i");
    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1 });
    const formatted = events.map(formatEventResponse);
    res.json({ success: true, count: formatted.length, events: formatted, data: { events: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 19. GET /api/v1/events/completed
exports.getCompletedEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const query = {
      $or: [{ status: "COMPLETED" }, { date: { $lt: today }, status: { $ne: "CANCELLED" } }],
    };
    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: -1 });
    const formatted = events.map(formatEventResponse);
    res.json({ success: true, count: formatted.length, events: formatted, data: { events: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 20. GET /api/v1/events/free
exports.getFreeEvents = async (req, res) => {
  try {
    const query = {
      status: { $in: ["PUBLISHED", "UPCOMING", "ONGOING"] },
      $or: [{ eventType: "FREE" }, { passMode: { $in: ["FREE", "BOTH"] } }],
    };
    if (req.query.city && req.query.city !== "ALL") query["venue.city"] = new RegExp(`^${req.query.city}$`, "i");
    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1 });
    const formatted = events.map(formatEventResponse);
    res.json({ success: true, count: formatted.length, events: formatted, data: { events: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 21. GET /api/v1/events/paid
exports.getPaidEvents = async (req, res) => {
  try {
    const query = {
      status: { $in: ["PUBLISHED", "UPCOMING", "ONGOING"] },
      eventType: "PAID",
    };
    if (req.query.city && req.query.city !== "ALL") query["venue.city"] = new RegExp(`^${req.query.city}$`, "i");
    const events = await Event.find(query)
      .populate("ticketTypes.typeId")
      .sort({ date: 1 });
    const formatted = events.map(formatEventResponse);
    res.json({ success: true, count: formatted.length, events: formatted, data: { events: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
