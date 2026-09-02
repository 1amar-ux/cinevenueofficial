const fs = require('fs');
const path = 'src/pages/events/EventCheckout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import { useAuth } from "../../context/AuthContext";',
  'import { AuthContext } from "../../context/AuthContext";\nimport { useContext } from "react";'
);

content = content.replace(
  'const { userEmail } = useAuth();',
  'const { userEmail } = useContext(AuthContext);'
);

fs.writeFileSync(path, content);
console.log("Fixed EventCheckout");
