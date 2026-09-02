const fs = require('fs');

function count(str, tag) {
    return str.split(tag).length - 1;
}

const content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
const numOpen = count(content, '<div');
const numClose = count(content, '</div');
console.log('AdminPanel div open:', numOpen, 'close:', numClose);
