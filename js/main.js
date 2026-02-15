document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        setup: 'pypsa',
        pipeline: 'fetch',
    };

    // GitHub source mapping
    const githubBaseUrl = 'https://github.com/helgeesch/mesqual-vanilla-studies/blob/main/studies/study_02_pypsa_eur_example/scripts/b_post_processing/';
    const githubSourceMap = {
        fetch: 'b_simple_fetch.py',
        heat: 'c_trade_balance_heatmap_dashboard.py',
        line: 'c_trade_balance_line_fig.py',
        map: 'd_netpos_price_map.py',
    };

    // Preview zoom levels per pipeline tab
    const previewScaleMap = {
        fetch: 0.8,
        heat: 0.45,
        line: 0.8,
        map: 0.65,
    };

    // DOM Elements
    const setupTabs = document.getElementById('setup-tabs');
    const pipelineTabs = document.getElementById('pipeline-tabs');
    const setupCodeEl = document.getElementById('setup-code');
    const pipelineCodeEl = document.getElementById('pipeline-code');
    const previewFrame = document.getElementById('preview-frame');
    const githubLink = document.getElementById('github-source-link');

    // --- Core Function to Update View ---
    async function updateView() {
        // Construct file paths
        const setupCodePath = `code/${state.setup}/a_study_setup.py`;
        const pipelineCodePath = `code/${state.setup}/${state.pipeline}.py`;
        const previewPath = `previews/${state.pipeline}.html`;

        try {
            // Fetch and display code snippets
            const [setupCode, pipelineCode] = await Promise.all([
                fetch(setupCodePath).then(res => res.ok ? res.text() : `File not found: ${setupCodePath}`),
                fetch(pipelineCodePath).then(res => res.ok ? res.text() : `File not found: ${pipelineCodePath}`)
            ]);

            setupCodeEl.innerHTML = betterHighlight(setupCode);
            pipelineCodeEl.innerHTML = betterHighlight(pipelineCode);

            // Update preview iframe with per-pipeline zoom
            const scale = previewScaleMap[state.pipeline] || 0.5;
            previewFrame.style.transform = `scale(${scale})`;
            previewFrame.style.width = `${100 / scale}%`;
            previewFrame.style.height = `${100 / scale}%`;
            previewFrame.src = previewPath;

            // Update GitHub source link
            if (githubLink && githubSourceMap[state.pipeline]) {
                githubLink.href = githubBaseUrl + githubSourceMap[state.pipeline];
            }

        } catch (error) {
            console.error("Failed to load assets:", error);
            setupCodeEl.textContent = `Error loading file.`;
            pipelineCodeEl.textContent = `Error loading file.`;
        }

        // Update active tab styles
        updateActiveTabs();
    }

    // --- Event Listeners ---
    setupTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.setup) {
            state.setup = e.target.dataset.setup;
            updateView();
        }
    });

    pipelineTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.pipeline) {
            state.pipeline = e.target.dataset.pipeline;
            updateView();
        }
    });

    // --- Helper Functions ---
    function updateActiveTabs() {
        document.querySelectorAll('#setup-tabs .tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.setup === state.setup);
        });
        document.querySelectorAll('#pipeline-tabs .tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pipeline === state.pipeline);
        });
    }

    function betterHighlight(code) {
        let html = code
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

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

        // Step 3: Now highlight everything else (no conflicts possible)

        // Decorators
        html = html.replace(/^(\s*)(@\w+)/gm, '$1<span class="decorator">$2</span>');

        // Keywords
        html = html.replace(/\b(from|import|def|class|return|as|for|in|if|else|elif|while|try|except|finally|with|is|not|and|or|pass|break|continue|lambda|yield|True|False|None)\b/g,
            '<span class="keyword">$&</span>');

        // Functions
        html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="function">$1</span>');

        // Numbers
        html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$&</span>');

        // Step 4: Restore strings and comments with styling
        html = html.replace(/###STRING_(\d+)###/g, (match, index) => {
            return `<span class="string">${strings[index]}</span>`;
        });

        html = html.replace(/###COMMENT_(\d+)###/g, (match, index) => {
            return `<span class="comment">${comments[index]}</span>`;
        });

        return html;
    }

    // --- Initial Load ---
    if(setupTabs && pipelineTabs && setupCodeEl && pipelineCodeEl && previewFrame) {
         updateView();
    } else {
        console.error("One or more essential elements for the interactive demo are missing.");
    }

    // Highlight extension card code snippets
    document.querySelectorAll('.extension-code pre code').forEach(el => {
        el.innerHTML = betterHighlight(el.textContent);
    });
});
