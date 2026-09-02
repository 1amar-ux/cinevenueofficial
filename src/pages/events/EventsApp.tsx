import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EventsHome from "./EventsHome";
import EventDetails from "./EventDetails";
import EventCheckout from "./EventCheckout";
import MyPasses from "./MyPasses";
import PassView from "./PassView";

export default function EventsApp() {
  return (
    <div className="bg-[#09090A] min-h-screen text-white font-sans">
      <Routes>
        <Route path="/" element={<EventsHome />} />
        <Route path="/:eventId" element={<EventDetails />} />
        <Route path="/:eventId/checkout" element={<EventCheckout />} />
        <Route path="/my-passes" element={<MyPasses />} />
        <Route path="/pass/:passId" element={<PassView />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </div>
  );
}
