const fs = require('fs');

// 1. Update React App Shell Templates
const reactTemplatesPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\pages\\Templates.tsx';
if (fs.existsSync(reactTemplatesPath)) {
  let content = fs.readFileSync(reactTemplatesPath, 'utf8');
  const oldTop = `<h1 style={{ margin: 0, fontSize: '1.5rem' }}>Templates</h1>`;
  const newTop = `<header className="baps-toolbar">
        <div className="baps-toolbar__start">
          <h1 className="baps-toolbar__title">Templates</h1>
        </div>
      </header>`;
  content = content.replace(oldTop, newTop);
  fs.writeFileSync(reactTemplatesPath, content, 'utf8');
}

// 2. Update Next.js App Shell Templates
const nextTemplatesPath = 'D:\\baps-projects\\nextjs-app-shell-mybky\\src\\app\\templates\\page.tsx';
if (fs.existsSync(nextTemplatesPath)) {
  let content2 = fs.readFileSync(nextTemplatesPath, 'utf8');
  const oldTop2 = `<h1 style={{ margin: 0, fontSize: '1.5rem' }}>Templates</h1>`;
  const newTop2 = `<header className="baps-toolbar">
        <div className="baps-toolbar__start">
          <h1 className="baps-toolbar__title">Templates</h1>
        </div>
      </header>`;
  content2 = content2.replace(oldTop2, newTop2);
  fs.writeFileSync(nextTemplatesPath, content2, 'utf8');
}

console.log('Templates updated successfully');
