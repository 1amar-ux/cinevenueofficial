const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace: return saved ? JSON.parse(saved) : XXX;
// with: try { return saved ? JSON.parse(saved) : XXX; } catch(e) { return XXX; }

content = content.replace(/return saved \? JSON\.parse\(saved\) : (.*?);/g, (match, p1) => {
  return `try { return saved ? JSON.parse(saved) : ${p1}; } catch(e) { return ${p1}; }`;
});

// also fix parsed things
content = content.replace(/const parsed = saved \? JSON\.parse\(saved\) : (.*?);/g, (match, p1) => {
  return `let parsed = ${p1};\n    try { if (saved) parsed = JSON.parse(saved); } catch(e) {}`;
});

fs.writeFileSync('src/App.tsx', content);
