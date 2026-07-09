const fs = require('fs');
const path = require('path');

const baseContentDir = path.join(__dirname, 'content');
const templatePath = path.join(__dirname, 'templates', 'subpage.html');
const indexPath = path.join(__dirname, 'index.html');
const faqPath = path.join(__dirname, 'faq.html');
const categories = ['neuigkeiten']; // Option A: news only

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

// Basic Markdown to HTML parser supporting Apple design system styling
function renderBasicHtml(mdText) {
    let html = mdText;

    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.35rem; font-weight:600; margin-bottom: 0.8rem; margin-top: 2rem; color: var(--color-primary);">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.75rem; font-weight:700; margin-bottom: 1.2rem; margin-top: 2.8rem; color: #fff; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2.2rem; font-weight:700; margin-bottom: 1.5rem; color: #fff;">$1</h1>');

    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--color-primary); padding-left: 1.25rem; margin: 2rem 0; font-size: 1.15rem; font-style: italic; color: var(--color-text-muted);">$1</blockquote>');

    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Images 
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="width: 100%; border-radius: 16px; margin: 2.2rem 0; border: 1px solid var(--color-border); box-shadow: 0 15px 35px rgba(0,0,0,0.5);">');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<ul>\n<li style="margin-bottom: 0.5rem; font-size:1rem; display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--color-primary);">•</span> $1</li>\n</ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, ''); // merge adjacent lists
    html = html.replace(/<ul>/gim, '<ul style="margin-bottom: 1.8rem; padding-left: 0.5rem; display:flex; flex-direction:column; gap:0.4rem;">');

    // Paragraphs
    let paragraphs = html.split('\n\n');
    paragraphs = paragraphs.map(p => {
        if (!p.trim()) return '';
        if (p.trim().startsWith('<h') || p.trim().startsWith('<img') || p.trim().startsWith('<ul') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<div')) {
            return p.trim();
        }
        return `<p style="margin-bottom: 1.25rem; line-height:1.7; color: var(--color-text-main); font-size:1.05rem;">${p.trim()}</p>`;
    });

    return paragraphs.join('\n');
}

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
    if (!fs.existsSync(templatePath)) {
        console.error(`Template ${templatePath} does not exist`);
        return;
    }
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const footerPath = path.join(__dirname, 'templates', 'footer.html');
    const footerTemplate = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, 'utf8') : '';

    categories.forEach(category => {
        const catDir = path.join(baseContentDir, category);
        const outDir = path.join(__dirname, category);

        if (!fs.existsSync(catDir)) {
            fs.mkdirSync(catDir, { recursive: true });
        }
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const posts = [];

        if (category === 'neuigkeiten') {
            const folders = fs.readdirSync(catDir).filter(f => fs.statSync(path.join(catDir, f)).isDirectory());

            folders.forEach(folder => {
                // Skip building/displaying expired Supercross post starting July 6, 2026
                if (folder === '2026-07-04-supercross' && Date.now() >= new Date('2026-07-06T00:00:00').getTime()) {
                    console.log("Skipping expired news post: 2026-07-04-supercross");
                    const compiledPath = path.join(outDir, `${folder}.html`);
                    if (fs.existsSync(compiledPath)) {
                        fs.unlinkSync(compiledPath);
                    }
                    return;
                }
                // Skip building/displaying expired Girlsday post starting August 9, 2026
                if (folder === '2026-08-08-girlsday' && Date.now() >= new Date('2026-08-09T00:00:00').getTime()) {
                    console.log("Skipping expired news post: 2026-08-08-girlsday");
                    const compiledPath = path.join(outDir, `${folder}.html`);
                    if (fs.existsSync(compiledPath)) {
                        fs.unlinkSync(compiledPath);
                    }
                    return;
                }
                
                const postPath = path.join(catDir, folder, 'post.md');
                if (fs.existsSync(postPath)) {
                    processFile(postPath, folder, category, templateContent, footerTemplate, outDir, posts, true);
                }
            });

            // Update index.html news carousel
            updateNewsCarousel(posts);

            // Update index.html footer
            updateMasterFooter(footerTemplate);
        }
    });

    // Update static pages
    if (fs.existsSync(footerPath)) {
        updateStaticPage(path.join(__dirname, 'rechtliches', 'impressum.html'), footerTemplate, '../');
        updateStaticPage(path.join(__dirname, 'rechtliches', 'datenschutz.html'), footerTemplate, '../');
        updateStaticPage(faqPath, footerTemplate, '');
    }

    console.log("Build complete.");
}

function processFile(mdPath, slug, category, templateContent, footerTemplate, outDir, postsArray, isNews) {
    const rawContent = fs.readFileSync(mdPath, 'utf8');
    const parsed = parseMarkdown(rawContent);
    const htmlContent = renderBasicHtml(parsed.content);

    let finalImageHtml = '';
    if (parsed.data.bild) {
        let imgSrc = parsed.data.bild;
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            if (isNews) {
                imgSrc = `../content/neuigkeiten/${slug}/${imgSrc}`;
            } else {
                imgSrc = `../${imgSrc}`; 
            }
        }
        finalImageHtml = `<img src="${imgSrc}" alt="${parsed.data.titel}" style="width: 100%; border-radius: 16px; border:1px solid var(--color-border); margin-bottom: 2rem; box-shadow: 0 15px 35px rgba(0,0,0,0.5);">`;
    }

    let backLabel = 'Zurück zu den Neuigkeiten';
    let backHash = 'neuigkeiten';
    if (slug === '2026-08-08-girlsday' || slug === '2026-07-04-supercross') {
        backLabel = 'Zurück zu den Terminen';
        backHash = 'termine';
    }

    const backButtonHtml = `<div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-start; align-items: center;">
                        <a href="../index.html#${backHash}" class="btn btn-outline">&larr; ${backLabel}</a>
                    </div>`;

    const processedFooter = footerTemplate.replace(/\{\{PATH\}\}/g, '../');

    let postHtml = templateContent
        .replace(/\{\{TITLE\}\}/g, parsed.data.titel || 'Subpage')
        .replace(/\{\{DATE\}\}/g, parsed.data.datum || '')
        .replace(/\{\{DESCRIPTION\}\}/g, parsed.data.kurzbeschreibung || '')
        .replace(/\{\{CONTENT\}\}/g, finalImageHtml + '\n\n' + htmlContent)
        .replace(/\{\{BACK_BUTTON\}\}/g, backButtonHtml)
        .replace(/\{\{FOOTER\}\}/g, processedFooter);

    const outPath = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(outPath, postHtml);
    console.log(`Built subpage: ${category}/${slug}.html`);

    if (isNews && postsArray) {
        postsArray.push({
            slug,
            data: parsed.data,
            dateValue: parseDate(parsed.data.datum || '')
        });
    }
}

function updateNewsCarousel(posts) {
    posts.sort((a, b) => b.dateValue - a.dateValue); // Newest first

    let carouselHtml = '';
    posts.forEach(post => {
        carouselHtml += `
                        <article class="event-card">
                            <div class="event-details" style="width: 100%;">
                                <span class="time" style="margin-bottom: 0.4rem;">${post.data.datum}</span>
                                <h3 style="margin-top: 0.2rem;">${post.data.titel}</h3>
                                <p>${post.data.kurzbeschreibung}</p>
                                <a href="neuigkeiten/${post.slug}.html" class="apple-link" style="margin-top: 1.25rem; font-size:0.95rem;">Mehr erfahren <svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z"/></svg></a>
                            </div>
                        </article>\n`;
    });

    if (!fs.existsSync(indexPath)) {
        console.error("index.html not found, skipping news carousel replacement");
        return;
    }

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
        console.log('Updated index.html news carousel.');
    }
}

function updateMasterFooter(footerTemplate) {
    if (!fs.existsSync(indexPath)) return;
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const processedFooter = footerTemplate.replace(/\{\{PATH\}\}/g, '');
    
    const footerRegex = /<footer class="site-footer">[\s\S]*?<\/footer>/;
    if (footerRegex.test(indexContent)) {
        indexContent = indexContent.replace(footerRegex, processedFooter);
        fs.writeFileSync(indexPath, indexContent);
        console.log('Updated index.html footer.');
    }
}

function updateStaticPage(filePath, footerTemplate, pathPrefix) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const processedFooter = footerTemplate.replace(/\{\{PATH\}\}/g, pathPrefix);
    
    const footerRegex = /<footer class="site-footer">[\s\S]*?<\/footer>/;
    if (footerRegex.test(content)) {
        content = content.replace(footerRegex, processedFooter);
        fs.writeFileSync(filePath, content);
        console.log(`Updated static page footer: ${path.basename(filePath)}`);
    }
}

build();
