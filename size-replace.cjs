const fs = require('fs');
const path = require('path');

const filePath = 'client/src/components/layout/TopNavBar.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all size={number} with size="number" for icons
content = content.replace(/size=\{(\d+)\}/g, (match, size) => {
  return ;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('All icon sizes updated to strings in TopNavBar.tsx');
