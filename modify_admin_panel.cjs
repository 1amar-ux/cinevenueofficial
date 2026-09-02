const fs = require('fs');
const path = 'src/components/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import EventsAdminModule')) {
  content = content.replace('import React, {', 'import React, {\n  //\n} from "react";\nimport EventsAdminModule from "./admin/events/EventsAdminModule";\nimport {');
}

const startMarker = '{activeTab === "events" && (';
const endMarker = '{activeTab === "settings" && (';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `{activeTab === "events" && (
            <div className="space-y-8 animate-fade-in" id="tab-events">
              <EventsAdminModule />
            </div>
          )}\n\n          ` + content.substring(endIndex);
          
  fs.writeFileSync(path, newContent);
  console.log("AdminPanel updated to use EventsAdminModule");
} else {
  console.log("Could not find markers.");
}
