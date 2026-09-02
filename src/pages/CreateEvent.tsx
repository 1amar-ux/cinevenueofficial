import React from "react";
import EventManagementHub from "../components/events/EventManagementHub";

export default function CreateEvent() {
  const userEmail = localStorage.getItem("cine_user_email") || "amarnathgattem@gmail.com";

  return (
    <EventManagementHub
      userEmail={userEmail}
      onNavigateHome={() => window.location.href = "/"}
    />
  );
}
