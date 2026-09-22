const Event = require("../models/Event");
const EventTicketType = require("../models/EventTicketType");

// Helper to generate URL slug
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

// 1. Get published events
exports.getEvents = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 20 } = req.query;

    const query = {
      status: "PUBLISHED",
    };

    if (city) {
      query["venue.city"] = new RegExp(`^${city}$`, "i");
    }

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get event by slug or ID
exports.getEventBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is MongoDB ObjectId or slug string
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { $or: [{ _id: identifier }, { slug: identifier }] } : { slug: identifier };

    const event = await Event.findOne(query).populate("ticketTypes.typeId");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Create Event (Admin / Organizer)
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
      ticketTypes, // optional inline array
    } = req.body;

    if (!title || !venue || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "title, venue (name & city), date, and startTime are required",
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
      organizerId: req.user ? req.user.id : null,
      venue,
      date: new Date(date),
      startTime,
      endTime,
      status: "PUBLISHED",
      bookingStatus: "OPEN",
      termsAndConditions: termsAndConditions || undefined,
    });

    // If ticket types provided inline, create them
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Update Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event updated", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Add Ticket Type to Event
exports.addTicketType = async (req, res) => {
  try {
    const { id } = req.params; // eventId
    const { name, description, price, availableQuantity, maxPerBooking } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const ticketType = await EventTicketType.create({
      eventId: event._id,
      name,
      description,
      price: Number(price),
      availableQuantity: Number(availableQuantity),
      maxPerBooking: maxPerBooking ? Number(maxPerBooking) : 10,
      status: "ACTIVE",
    });

    event.ticketTypes.push({ typeId: ticketType._id });
    await event.save();

    res.status(201).json({
      success: true,
      message: "Ticket category added successfully",
      ticketType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
