const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('route.js')) {
            results.push(file);
        }
    });
    return results;
}

const routes = walk(path.join(__dirname, '..', 'app', 'api'));
let updatedCount = 0;

for (const route of routes) {
    let content = fs.readFileSync(route, 'utf8');
    if (!content.includes('export const dynamic')) {
        // Add to the top of the file, after imports if possible, or just very top.
        content = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(route, content, 'utf8');
        console.log('Updated', route);
        updatedCount++;
    }
}

console.log(`Finished updating ${updatedCount} files.`);
