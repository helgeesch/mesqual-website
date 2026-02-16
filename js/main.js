document.addEventListener('DOMContentLoaded', () => {
    // --------------- State ---------------
    const state = {
        setup: 'pypsa',
        pipeline: null,   // null = nudge state (no pipeline selected yet)
    };

    // --------------- Config ---------------
    const githubBaseUrl = 'https://github.com/helgeesch/mesqual-vanilla-studies/blob/main/studies/study_02_pypsa_eur_example/scripts/b_post_processing/';
    const githubSourceMap = {
        fetch: 'b_simple_fetch.py',
        heat: 'c_trade_balance_heatmap_dashboard.py',
        line: 'c_trade_balance_line_fig.py',
        map: 'd_netpos_price_map.py',
    };
    const docsBaseUrl = 'https://docs.mesqual.io/mesqual-package-documentation/api_reference/';
    const docsSourceMap = {
        fetch: 'datasets/',
        heat: 'visualization/',
        line: 'visualization/',
        map: 'visualization/folium_viz_system/',
    };
    const previewScaleMap = {
        fetch: 0.8,
        heat: 0.45,
        line: 0.8,
        map: 0.65,
    };
    const fullscreenScaleMap = {
        fetch: 1.0,
        heat: 0.7,
        line: 1.0,
        map: 0.85,
    };

    // --------------- DOM refs ---------------
    const setupTabs       = document.getElementById('setup-tabs');
    const pipelineTabs    = document.getElementById('pipeline-tabs');
    const setupCodeEl     = document.getElementById('setup-code');
    const pipelineCodeEl  = document.getElementById('pipeline-code');
    const previewPane     = document.getElementById('preview-pane');
    const previewSpinner  = document.getElementById('preview-spinner');
    const previewFrame    = document.getElementById('preview-frame');
    const githubLink      = document.getElementById('github-source-link');
    const docsLink        = document.getElementById('docs-source-link');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenFrame   = document.getElementById('fullscreen-frame');
    const fullscreenBtn      = document.getElementById('fullscreen-btn');
    const fullscreenCloseBtn = document.getElementById('fullscreen-close');
    const fullscreenContent  = document.querySelector('.fullscreen-content');

    // Guard — bail if critical elements are missing
    if (!setupTabs || !pipelineTabs || !setupCodeEl || !pipelineCodeEl || !previewFrame) {
        console.error('Interactive demo: missing DOM elements');
        return;
    }

    // --------------- Syntax Highlighter ---------------
    function betterHighlight(code) {
        let html = code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Step 1: Extract and protect comments
        const comments = [];
        html = html.replace(/(#.*$)/gm, (match) => {
            comments.push(match);
            return `###COMMENT_${comments.length - 1}###`;
        });

        // Step 2: Extract and protect strings
        const strings = [];
        html = html.replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|("""[\s\S]*?""")|('''[\s\S]*?''')/g, (match) => {
            strings.push(match);
            return `###STRING_${strings.length - 1}###`;
        });

        // Step 3: Highlight remaining tokens
        html = html.replace(/^(\s*)(@\w+)/gm, '$1<span class="decorator">$2</span>');
        html = html.replace(/\b(from|import|def|class|return|as|for|in|if|else|elif|while|try|except|finally|with|is|not|and|or|pass|break|continue|lambda|yield|True|False|None)\b/g,
            '<span class="keyword">$&</span>');
        html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="function">$1</span>');
        html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$&</span>');

        // Step 4: Restore strings and comments
        html = html.replace(/###STRING_(\d+)###/g, (_, i) => `<span class="string">${strings[i]}</span>`);
        html = html.replace(/###COMMENT_(\d+)###/g, (_, i) => `<span class="comment">${comments[i]}</span>`);

        return html;
    }

    // --------------- Typewriter Engine ---------------
    let typewriterAnimId = null;

    function cancelTypewriter() {
        if (typewriterAnimId) {
            cancelAnimationFrame(typewriterAnimId);
            typewriterAnimId = null;
        }
    }

    /**
     * Progressively reveals the visible text inside `element` whose innerHTML
     * has already been set to `html`.  HTML tags appear instantly; only the
     * text-node characters are "typed" one by one over `duration` ms.
     * A blinking cursor is shown via the CSS class `typing` on the element.
     */
    function typewriteHTML(element, html, duration) {
        if (duration === undefined) duration = 500;
        cancelTypewriter();

        // Set full highlighted DOM structure, then blank every text node
        element.innerHTML = html;
        element.classList.add('typing');

        const textEntries = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            textEntries.push({ node: node, fullText: node.textContent });
            node.textContent = '';
        }

        const totalChars = textEntries.reduce(function (sum, e) { return sum + e.fullText.length; }, 0);
        if (totalChars === 0) {
            element.classList.remove('typing');
            return Promise.resolve();
        }

        var charDelay = duration / totalChars;

        return new Promise(function (resolve) {
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var target = Math.min(
                    Math.floor((timestamp - startTime) / charDelay),
                    totalChars
                );

                var charsLeft = target;
                for (var i = 0; i < textEntries.length; i++) {
                    var entry = textEntries[i];
                    var len = entry.fullText.length;
                    if (charsLeft >= len) {
                        entry.node.textContent = entry.fullText;
                        charsLeft -= len;
                    } else if (charsLeft > 0) {
                        entry.node.textContent = entry.fullText.substring(0, charsLeft);
                        charsLeft = 0;
                    } else {
                        entry.node.textContent = '';
                    }
                }

                if (target >= totalChars) {
                    element.classList.remove('typing');
                    typewriterAnimId = null;
                    resolve();
                } else {
                    typewriterAnimId = requestAnimationFrame(step);
                }
            }

            typewriterAnimId = requestAnimationFrame(step);
        });
    }

    // --------------- Setup Code (always instant) ---------------
    async function loadSetupCode() {
        const path = `code/${state.setup}/a_study_setup.py`;
        try {
            const code = await fetch(path).then(r => r.ok ? r.text() : `# File not found: ${path}`);
            setupCodeEl.innerHTML = betterHighlight(code);
        } catch (_) {
            setupCodeEl.textContent = '# Error loading file.';
        }
    }

    // --------------- Pipeline Code ---------------
    async function loadPipelineCode(animate) {
        if (!state.pipeline) return;
        const path = `code/${state.setup}/${state.pipeline}.py`;
        try {
            const code = await fetch(path).then(r => r.ok ? r.text() : `# File not found: ${path}`);
            const html = betterHighlight(code);
            if (animate) {
                await typewriteHTML(pipelineCodeEl, html, 1000);
            } else {
                cancelTypewriter();
                pipelineCodeEl.classList.remove('typing');
                pipelineCodeEl.innerHTML = html;
            }
        } catch (_) {
            cancelTypewriter();
            pipelineCodeEl.classList.remove('typing');
            pipelineCodeEl.textContent = '# Error loading file.';
        }
    }

    // --------------- Preview (lazy) ---------------
    let previewDelayTimer = null;

    function showPreviewSpinner() {
        previewPane.classList.remove('collapsed');
        previewSpinner.classList.add('active');
        previewFrame.classList.remove('loaded');
    }

    function loadPreviewIframe() {
        if (!state.pipeline) return;
        const scale = previewScaleMap[state.pipeline] || 0.5;
        previewFrame.style.transform = `scale(${scale})`;
        previewFrame.style.width  = `${100 / scale}%`;
        previewFrame.style.height = `${100 / scale}%`;
        previewFrame.src = `previews/${state.pipeline}.html`;
    }

    previewFrame.addEventListener('load', () => {
        if (previewFrame.src && !previewFrame.src.endsWith('about:blank')) {
            previewSpinner.classList.remove('active');
            previewFrame.classList.add('loaded');
        }
    });

    // --------------- Source links ---------------
    function updateSourceLinks() {
        if (githubLink && state.pipeline && githubSourceMap[state.pipeline]) {
            githubLink.href = githubBaseUrl + githubSourceMap[state.pipeline];
        }
        if (docsLink && state.pipeline && docsSourceMap[state.pipeline]) {
            docsLink.href = docsBaseUrl + docsSourceMap[state.pipeline];
        }
    }

    // --------------- Tab highlighting ---------------
    function updateActiveTabs() {
        setupTabs.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.setup === state.setup);
        });
        pipelineTabs.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pipeline === state.pipeline);
        });
    }

    // --------------- Event: Setup tab (instant, no typewriter) ---------------
    setupTabs.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' || !e.target.dataset.setup) return;
        const next = e.target.dataset.setup;
        if (next === state.setup) return;

        state.setup = next;
        loadSetupCode();

        // Right pane updates instantly (showing the code stays the same)
        if (state.pipeline) {
            loadPipelineCode(false);
        }
        // Preview stays unchanged — same output regardless of platform
        updateActiveTabs();
    });

    // --------------- Event: Pipeline tab (typewriter → then preview) ---------------
    pipelineTabs.addEventListener('click', async (e) => {
        if (e.target.tagName !== 'BUTTON' || !e.target.dataset.pipeline) return;
        const next = e.target.dataset.pipeline;
        if (next === state.pipeline) return;

        state.pipeline = next;
        updateSourceLinks();
        updateActiveTabs();

        // Cancel any pending preview load from previous tab switch
        if (previewDelayTimer) { clearTimeout(previewDelayTimer); previewDelayTimer = null; }

        // Typewrite the code first
        await loadPipelineCode(true);

        // Show preview pane with spinner, then load iframe after a brief pause
        showPreviewSpinner();
        previewDelayTimer = setTimeout(() => {
            loadPreviewIframe();
            previewDelayTimer = null;
        }, 400);
    });

    // --------------- Fullscreen ---------------
    function openFullscreen() {
        if (!state.pipeline || !fullscreenOverlay) return;
        // Apply per-pipeline zoom to fullscreen iframe
        const scale = fullscreenScaleMap[state.pipeline] || 1.0;
        fullscreenFrame.style.transform = `scale(${scale})`;
        fullscreenFrame.style.width  = `${100 / scale}%`;
        fullscreenFrame.style.height = `${100 / scale}%`;
        fullscreenFrame.src = `previews/${state.pipeline}.html`;
        fullscreenOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFullscreen() {
        if (!fullscreenOverlay) return;
        fullscreenOverlay.classList.remove('active');
        document.body.style.overflow = '';
        fullscreenFrame.src = 'about:blank';
    }

    if (fullscreenBtn) fullscreenBtn.addEventListener('click', openFullscreen);
    if (fullscreenCloseBtn) fullscreenCloseBtn.addEventListener('click', closeFullscreen);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenOverlay && fullscreenOverlay.classList.contains('active')) {
            closeFullscreen();
        }
    });

    // --------------- Nudge (initial right-pane state) ---------------
    function showNudge() {
        const nudgeHtml = '<span class="comment"># Select a use case \u2191</span>';
        typewriteHTML(pipelineCodeEl, nudgeHtml, 1200);
    }

    // --------------- Initial Load ---------------
    loadSetupCode();
    previewPane.classList.add('collapsed');
    updateActiveTabs();

    // Trigger nudge when code viewer scrolls into view
    const codeViewer = document.querySelector('.code-viewer-container');
    if (codeViewer) {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !state.pipeline) {
                    showNudge();
                    observer.disconnect();
                    break;
                }
            }
        }, { threshold: 0.3 });
        observer.observe(codeViewer);
    }

    // --------------- Extension card syntax highlighting ---------------
    document.querySelectorAll('.extension-code pre code').forEach(el => {
        el.innerHTML = betterHighlight(el.textContent);
    });
});
