const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content', 'neuigkeiten');
const templatePath = path.join(__dirname, 'templates', 'news-detail.html');
const indexPath = path.join(__dirname, 'index.html');
const outDir = path.join(__dirname, 'neuigkeiten');

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
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: #fff;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 2rem; margin-bottom: 1.5rem; margin-top: 2rem; color: #fff;">$1</h2>');
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
    // add some margin to the ul wrapper
    html = html.replace(/<ul>/gim, '<ul style="margin-bottom: 2rem; padding-left: 1.5rem;">');

    // Paragraphs
    let paragraphs = html.split('\n\n');
    paragraphs = paragraphs.map(p => {
        if (!p.trim()) return '';
        if (p.trim().startsWith('<h') || p.trim().startsWith('<img') || p.trim().startsWith('<ul') || p.trim().startsWith('<blockquote')) {
            return p.trim();
        }
        return `<p style="margin-bottom: 1.5rem;">${p.trim()}</p>`;
    });

    return paragraphs.join('\n');
}

// Helper to convert german month strings for sorting
const monthMap = {
    'jan': 0, 'feb': 1, 'mär': 2, 'mar': 2, 'apr': 3, 'mai': 4,
    'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9,
    'oct': 9, 'nov': 10, 'dez': 11, 'dec': 11
};

function parseDate(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.trim().toLowerCase().split(/[ .]+/);
    if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const month = monthMap[parts[1].substring(0, 3)] || 0;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
    }
    return 0;
}

function build() {
    if (!fs.existsSync(contentDir)) {
        console.log(`Directory ${contentDir} does not exist`);
        return;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const posts = [];

    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Read directories
    const folders = fs.readdirSync(contentDir).filter(f => fs.statSync(path.join(contentDir, f)).isDirectory());

    folders.forEach(folder => {
        const postPath = path.join(contentDir, folder, 'post.md');
        if (fs.existsSync(postPath)) {
            const rawContent = fs.readFileSync(postPath, 'utf8');
            const parsed = parseMarkdown(rawContent);
            const htmlContent = renderBasicHtml(parsed.content);

            const slug = folder; // e.g. 2026-02-20-streckenumbau
            const dateStr = parsed.data.datum || '';

            let finalImageHtml = '';
            if (parsed.data.bild) {
                // assume the image is either a URL or in the same content folder
                let imgSrc = parsed.data.bild;
                if (!imgSrc.startsWith('http')) {
                    // It's a local file. We'll link to ../content/neuigkeiten/SLUG/bild.jpg
                    imgSrc = `../content/neuigkeiten/${slug}/${imgSrc}`;
                }
                finalImageHtml = `<img src="${imgSrc}" alt="${parsed.data.titel}" style="width: 100%; border-radius: 12px; margin-bottom: 3rem; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
            }

            // Generate detail HTML
            let postHtml = templateContent
                .replace(/\{\{TITLE\}\}/g, parsed.data.titel || 'Neuigkeit')
                .replace(/\{\{DATE\}\}/g, dateStr)
                .replace(/\{\{DESCRIPTION\}\}/g, parsed.data.kurzbeschreibung || '')
                .replace(/\{\{CONTENT\}\}/g, finalImageHtml + '\n\n' + htmlContent);

            const outPath = path.join(outDir, `${slug}.html`);
            fs.writeFileSync(outPath, postHtml);

            posts.push({
                slug,
                data: parsed.data,
                dateValue: parseDate(dateStr)
            });
            console.log(`Built post: ${slug}.html`);
        }
    });

    // Sort posts by date ascending (chronological: oldest left, newest right)
    posts.sort((a, b) => a.dateValue - b.dateValue);

    // Generate Carousel Cards
    let carouselHtml = '';
    posts.forEach(post => {
        carouselHtml += `
                        <article class="event-card">
                            <div class="event-details" style="width: 100%;">
                                <span class="time" style="margin-bottom: 0.5rem;">${post.data.datum}</span>
                                <h3 style="margin-top: 0.5rem;">${post.data.titel}</h3>
                                <p>${post.data.kurzbeschreibung}</p>
                                <a href="neuigkeiten/${post.slug}.html" class="btn btn-outline" style="margin-top: 1.5rem; padding: 0.5rem 1.2rem; display: inline-block; font-size: 0.9rem;">Mehr erfahren &rarr;</a>
                            </div>
                        </article>\n`;
    });

    // Inject into index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const startMarker = '<!-- REPLACEMENT_MARKER_NEWS_START -->';
    const endMarker = '<!-- REPLACEMENT_MARKER_NEWS_END -->';

    const startIndex = indexContent.indexOf(startMarker);
    const endIndex = indexContent.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
        indexContent = indexContent.substring(0, startIndex + startMarker.length)
            + '\n' + carouselHtml
            + '                        ' + indexContent.substring(endIndex);
        fs.writeFileSync(indexPath, indexContent);
        console.log('Successfully updated index.html with new carousel items.');
    } else {
        console.warn('Could not find REPLACEMENT_MARKER_NEWS markers in index.html');
    }
}

build();
