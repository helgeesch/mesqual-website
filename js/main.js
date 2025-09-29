document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        setup: 'pypsa',
        pipeline: 'kpi',
    };

    // DOM Elements
    const setupTabs = document.getElementById('setup-tabs');
    const pipelineTabs = document.getElementById('pipeline-tabs');
    const setupCodeEl = document.getElementById('setup-code');
    const pipelineCodeEl = document.getElementById('pipeline-code');
    const previewFrame = document.getElementById('preview-frame');

    // --- Core Function to Update View ---
    async function updateView() {
        // Construct file paths
        const setupCodePath = `code/${state.setup}/setup.py`;
        const pipelineCodePath = `code/${state.setup}/${state.pipeline}.py`;
        const previewPath = `previews/${state.setup}/${state.pipeline}.html`;

        try {
            // Fetch and display code snippets
            const [setupCode, pipelineCode] = await Promise.all([
                fetch(setupCodePath).then(res => res.ok ? res.text() : `File not found: ${setupCodePath}`),
                fetch(pipelineCodePath).then(res => res.ok ? res.text() : `File not found: ${pipelineCodePath}`)
            ]);

            setupCodeEl.innerHTML = betterHighlight(setupCode);
            pipelineCodeEl.innerHTML = betterHighlight(pipelineCode);

            // Update preview iframe
            previewFrame.src = previewPath;

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
            .replace(/</g, "&lt;").replace(/>/g, "&gt;"); // HTML escape

        // Comments
        html = html.replace(/(#.*$)/gm, '<span class="comment">$1</span>');

        // Strings (single, double, triple)
        html = html.replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|("""[\s\S]*?""")|('''[\s\S]*?''')/g, '<span class="string">$&</span>');

        // Keywords
        html = html.replace(/\b(from|import|def|class|return|as|for|in|if|else|elif|while|try|except|finally|with|is|not|and|or|pass|break|continue|lambda|yield|True|False|None)\b/g, '<span class="keyword">$&</span>');

        // Functions and methods
        html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="function">$1</span>');

        // Classes (after 'class' keyword)
        html = html.replace(/(class\s+)(\w+)/g, '$1<span class="class">$2</span>');

        // Decorators
        html = html.replace(/^(\s*@\w+)/gm, '<span class="decorator">$1</span>');

        // Numbers
        html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

        return html;
    }

    // --- Initial Load ---
    if(setupTabs && pipelineTabs && setupCodeEl && pipelineCodeEl && previewFrame) {
         updateView();
    } else {
        console.error("One or more essential elements for the interactive demo are missing.");
    }
});
