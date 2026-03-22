const fs = require('fs');
const path = require('path');

const baseContentDir = path.join(__dirname, 'content');
const templatePath = path.join(__dirname, 'templates', 'subpage.html');
const categories = ['strecken', 'verein', 'initiativen'];

// Helper to extract front-matter
function parseMarkdown(fileContent) {
    const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = fileContent.match(fmRegex);

    if (!match) {
        return { data: {}, content: fileContent };
    }

    const fmText = match[1];
    const mdText = match[2];

    const data = {};
    fmText.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            data[key] = val;
        }
    });

    return { data, content: mdText };
}

// Very basic Markdown to HTML parser
function renderBasicHtml(mdText) {
    let html = mdText;

    // Convert headings
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 2rem; margin-bottom: 1.5rem; margin-top: 3rem; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2.5rem; margin-bottom: 2rem; color: #fff;">$1</h1>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--color-primary); padding-left: 1.5rem; margin: 2.5rem 0; font-size: 1.3rem; font-style: italic; color: #fff;">$1</blockquote>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Images 
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="width: 100%; border-radius: 12px; margin-bottom: 3rem; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<ul>\n<li style="margin-bottom: 0.5rem;">$1</li>\n</ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, ''); // merge adjacent lists
    html = html.replace(/<ul>/gim, '<ul style="margin-bottom: 2rem; padding-left: 1.5rem;" class="feature-list">');

    // Paragraphs
    let paragraphs = html.split('\n\n');
    paragraphs = paragraphs.map(p => {
        if (!p.trim()) return '';
        if (p.trim().startsWith('<h') || p.trim().startsWith('<img') || p.trim().startsWith('<ul') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<div')) {
            return p.trim();
        }
        return `<p style="margin-bottom: 1.5rem;">${p.trim()}</p>`;
    });

    return paragraphs.join('\n');
}

function build() {
    if (!fs.existsSync(templatePath)) {
        console.error(`Template ${templatePath} does not exist`);
        return;
    }
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    categories.forEach(category => {
        const catDir = path.join(baseContentDir, category);
        const outDir = path.join(__dirname, category);

        if (!fs.existsSync(catDir)) {
            // Create the content directory if it doesn't exist
            fs.mkdirSync(catDir, { recursive: true });
        }

        // Ensure output directory exists
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // Read all .md files in the category folder
        const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));

        files.forEach(file => {
            const mdPath = path.join(catDir, file);
            const slug = file.replace('.md', '');
            
            const rawContent = fs.readFileSync(mdPath, 'utf8');
            const parsed = parseMarkdown(rawContent);
            const htmlContent = renderBasicHtml(parsed.content);

            let finalImageHtml = '';
            if (parsed.data.bild) {
                let imgSrc = parsed.data.bild;
                if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
                    // Falls das Bild lokal im assets Ordner liegt z.B. 
                    imgSrc = `../${imgSrc}`; 
                }
                finalImageHtml = `<img src="${imgSrc}" alt="${parsed.data.titel}" style="width: 100%; border-radius: var(--border-radius); margin-bottom: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">`;
            }

            // Generate detail HTML using the template
            let postHtml = templateContent
                .replace(/\{\{TITLE\}\}/g, parsed.data.titel || 'Subpage')
                .replace(/\{\{DATE\}\}/g, parsed.data.datum || '')
                .replace(/\{\{DESCRIPTION\}\}/g, parsed.data.kurzbeschreibung || '')
                .replace(/\{\{CONTENT\}\}/g, finalImageHtml + '\n\n' + htmlContent);

            const outPath = path.join(outDir, `${slug}.html`);
            fs.writeFileSync(outPath, postHtml);
            
            console.log(`Built subpage: ${category}/${slug}.html`);
        });
    });
}

build();
