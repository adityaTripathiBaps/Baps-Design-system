const fs = require('fs');

let tsx = fs.readFileSync('D:\\baps-projects\\react-app-shell-sampark\\src\\components\\Table.tsx', 'utf8');

// Fix unclosed SVG tags
tsx = tsx.replace(/<rect([^>]*?[^\/])>/g, '<rect$1 />');
tsx = tsx.replace(/<path([^>]*?[^\/])>/g, '<path$1 />');
tsx = tsx.replace(/<circle([^>]*?[^\/])>/g, '<circle$1 />');
tsx = tsx.replace(/<polygon([^>]*?[^\/])>/g, '<polygon$1 />');

// Some other common unclosed tags
tsx = tsx.replace(/<col([^>]*?[^\/])>/g, '<col$1 />');

fs.writeFileSync('D:\\baps-projects\\react-app-shell-sampark\\src\\components\\Table.tsx', tsx);
console.log("Fixed SVG tags in Table.tsx");
