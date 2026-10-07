import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../../..');
const source = resolve(workspaceRoot, 'dist/libs/ui-kit/styles');
const destination = resolve(workspaceRoot, 'packages/ui-kit-react/dist/styles');

if (!existsSync(source)) {
  throw new Error(
    '[ui-kit-react] shared CSS is missing; build ui-kit before ui-kit-react',
  );
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });

console.log(
  '[ui-kit-react] copied canonical @org/ui-kit CSS; no React-local design styles generated',
);
