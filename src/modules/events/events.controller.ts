import { Request, Response } from 'express';

// Mock DB for events module
const mockEvents = [
  { id: '1', title: 'Pushpa 2 Pre-Release', type: 'Movie Pre-Release', capacity: 2000, date: '2024-12-04' }
];

const mockPasses = new Map();

export const getEvents = (req: Request, res: Response) => {
  res.json({ success: true, data: mockEvents });
};

export const getEventById = (req: Request, res: Response) => {
  const event = mockEvents.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
};

export const createEvent = (req: Request, res: Response) => {
  const newEvent = { id: Date.now().toString(), ...req.body };
  mockEvents.push(newEvent);
  res.json({ success: true, data: newEvent });
};

export const updateEvent = (req: Request, res: Response) => {
  const idx = mockEvents.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  mockEvents[idx] = { ...mockEvents[idx], ...req.body };
  res.json({ success: true, data: mockEvents[idx] });
};

export const registerForEvent = (req: Request, res: Response) => {
  const passId = `CV-EVT-${Math.floor(Math.random() * 1000000)}`;
  mockPasses.set(passId, { eventId: req.params.id, status: 'VALID', ...req.body });
  res.json({ success: true, passId, message: 'Registration successful' });
};

export const generateBulkPasses = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Bulk passes generated via background job' });
};

export const getPassDetails = (req: Request, res: Response) => {
  const pass = mockPasses.get(req.params.passId);
  if (!pass) return res.status(404).json({ success: false, message: 'Invalid Pass' });
  res.json({ success: true, data: pass });
};

export const checkInPass = (req: Request, res: Response) => {
  const pass = mockPasses.get(req.params.passId);
  if (!pass) return res.status(404).json({ success: false, message: 'INVALID PASS' });
  if (pass.status === 'CHECKED_IN') return res.status(400).json({ success: false, message: 'PASS ALREADY CHECKED IN' });
  
  pass.status = 'CHECKED_IN';
  pass.checkedInAt = new Date();
  mockPasses.set(req.params.passId, pass);
  
  res.json({ success: true, message: 'CHECK-IN SUCCESSFUL' });
};

export const generatePdfPass = (req: Request, res: Response) => {
  res.json({ success: true, pdfUrl: `https://cinevenue-storage.com/passes/${req.params.passId}.pdf` });
};
