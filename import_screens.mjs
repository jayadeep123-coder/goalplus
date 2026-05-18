import fs from 'fs/promises';
import { existsSync } from 'fs';

const screens = [
  { name: 'admin-hr-panel', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMTBiY2I0MzkwMzM4NDhlODEwM2EyY2E4EgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
  { name: 'reports', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMTBjOGZiMjEwMWE2MjllZjUzMjBhZjEyEgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
  { name: 'quarterly-check-in', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMDVmN2Y3Y2QwMjA3OWIyY2NmMTJmYTM0EgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
  { name: 'goal-creation-form', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMDYwOGFlYzkwOTI1YzRmZDk1MjdmYjI3EgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
  { name: 'manager-dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMDYyMDkzZTUwNTRjYzc3ODMwMzk3MjczEgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
  { name: 'login', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MWZjMDYzYjlhYzEwMzgzOTdkNmY1Mzg4NDQ4EgsSBxCeq63_7BwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzg1MTQ3ODU4MzUyNTg4MjU0MA&filename=&opi=89354086' },
];

async function run() {
  for (const screen of screens) {
    console.log('Downloading', screen.name);
    const res = await fetch(screen.url);
    let html = await res.text();
    
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) {
      console.log('No body found for', screen.name);
      continue;
    }
    let content = bodyMatch[1];
    
    content = content.replace(/class=/g, 'className=');
    content = content.replace(/for=/g, 'htmlFor=');
    content = content.replace(/<!--[\s\S]*?-->/g, ''); 
    
    // fix self closing tags
    content = content.replace(/<(input[^>]*?)(?<!\/)>/g, '<$1 />');
    content = content.replace(/<(img[^>]*?)(?<!\/)>/g, '<$1 />');
    content = content.replace(/<(br[^>]*?)(?<!\/)>/g, '<$1 />');
    content = content.replace(/<(hr[^>]*?)(?<!\/)>/g, '<$1 />');

    // remove inline styles that might break JSX
    content = content.replace(/style="([^"]+)"/g, '');
    
    // some SVG properties conversion
    content = content.replace(/stroke-width/g, 'strokeWidth');
    content = content.replace(/stroke-linecap/g, 'strokeLinecap');
    content = content.replace(/stroke-linejoin/g, 'strokeLinejoin');
    content = content.replace(/fill-rule/g, 'fillRule');
    content = content.replace(/clip-rule/g, 'clipRule');
    content = content.replace(/clip-path/g, 'clipPath');
    
    const componentStr = `export default function ${screen.name.replace(/-/g, '')}Page() {
  return (
    <div className="bg-page-base text-on-surface min-h-screen">
      ${content}
    </div>
  );
}`;

    const dir = `./src/app/${screen.name}`;
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(`${dir}/page.js`, componentStr);
    console.log('Saved', screen.name);
  }
}

run();
