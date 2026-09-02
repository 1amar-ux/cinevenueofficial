const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import EventsApp')) {
  content = content.replace('import MaintenancePage from "./components/MaintenancePage";', 'import MaintenancePage from "./components/MaintenancePage";\nimport EventsApp from "./pages/events/EventsApp";');
}

const targetStr = `{/* Corporate Luxury Homepage */}
      <Route
        path="/"`;

const newStr = `{/* Events Sub-website */}
      <Route path="/events/*" element={<EventsApp />} />

      {/* Corporate Luxury Homepage */}
      <Route
        path="/"`;

if (!content.includes('<Route path="/events/*"')) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(path, content);
  console.log("App routes updated for /events/*");
} else {
  console.log("Already updated");
}
