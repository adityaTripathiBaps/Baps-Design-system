const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/vite.config.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /server: \{ port: 4500 \},/,
  "server: { port: 4500, fs: { allow: ['..'] } },"
);

fs.writeFileSync(path, content);
console.log('Fixed vite.config.ts server.fs.allow');
