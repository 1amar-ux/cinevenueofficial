const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");

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
    const { city, search, category, page = 1, limit = 20 } = req.query;

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

// 3. GET /api/v1/events/:eventId/tickets (Get ticket types)
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
      status: "ACTIVE",
    }).sort({ price: 1 });

    res.json({
      success: true,
      count: ticketTypes.length,
      ticketTypes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. POST /api/v1/admin/events (Admin create event)
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
    } = req.body;

    if (!title || !venue || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "title, venue, date, and startTime are required",
      });
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

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
      termsAndConditions: termsAndConditions || undefined,
    });

    if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      const createdTypes = [];
      for (const tt of ticketTypes) {
        const typeDoc = await EventTicketType.create({
          eventId: event._id,
          name: tt.name,
          description: tt.description || "",
          price: Number(tt.price) || 0,
          availableQuantity: Number(tt.availableQuantity) || 100,
          maxPerBooking: Number(tt.maxPerBooking) || 10,
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

// 6. POST /api/v1/admin/events/:eventId/publish (Admin publish event)
exports.publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "PUBLISHED", bookingStatus: "OPEN" },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event published successfully", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. POST /api/v1/admin/events/:eventId/close-booking (Admin close booking)
exports.closeBooking = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { bookingStatus: "CLOSED" },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event booking closed", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
