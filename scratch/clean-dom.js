const fs = require('fs');

let html = fs.readFileSync('scratch/table-dom.html', 'utf8');

// Basic JSX cleanup
html = html.replace(/class=/g, 'className=');
html = html.replace(/for=/g, 'htmlFor=');
html = html.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
html = html.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
html = html.replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />');
html = html.replace(/<br([^>]*?[^\/])>/g, '<br$1 />');

// Remove problematic inline styles that might break React
html = html.replace(/style="[^"]*"/g, '');

// Wrap in a component
const componentStr = `export function Table() {
  return (
    <div className="app-page__body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      ${html}
    </div>
  );
}
`;

fs.writeFileSync('D:\\baps-projects\\react-app-shell-sampark\\src\\components\\Table.tsx', componentStr);
console.log("Created Table.tsx");
