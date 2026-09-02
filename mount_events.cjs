const fs = require('fs');
const path = 'server.ts';
let content = fs.readFileSync(path, 'utf8');

const importStatement = `import eventRoutes from "./src/modules/events/events.routes";\n`;
if (!content.includes(importStatement)) {
  content = content.replace(
    'import settlementRoutes from "./src/modules/settlements/settlements.routes";',
    'import settlementRoutes from "./src/modules/settlements/settlements.routes";\nimport eventRoutes from "./src/modules/events/events.routes";'
  );
}

const useStatement = `  app.use("/api", eventRoutes);\n`;
if (!content.includes(useStatement)) {
  content = content.replace(
    '  app.use("/api", settlementRoutes);',
    '  app.use("/api", settlementRoutes);\n  app.use("/api", eventRoutes);'
  );
}

fs.writeFileSync(path, content);
console.log("Mounted events routes");
