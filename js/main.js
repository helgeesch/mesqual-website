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
                fetch(setupCodePath).then(res => res.text()),
                fetch(pipelineCodePath).then(res => res.text())
            ]);

            // Simple syntax highlighting (can be improved)
            setupCodeEl.innerHTML = highlightSyntax(setupCode);
            pipelineCodeEl.innerHTML = highlightSyntax(pipelineCode);

            // Update preview iframe
            previewFrame.src = previewPath;

        } catch (error) {
            console.error("Failed to load assets:", error);
            setupCodeEl.textContent = `Error loading: ${setupCodePath}`;
            pipelineCodeEl.textContent = `Error loading: ${pipelineCodePath}`;
        }

        // Update active tab styles
        updateActiveTabs();
    }

    // --- Event Listeners ---
    setupTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            state.setup = e.target.dataset.setup;
            updateView();
        }
    });

    pipelineTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
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

    function highlightSyntax(code) {
        // A very basic highlighter, you can replace this with a library like Prism.js or highlight.js
        return code
            .replace(/</g, "&lt;").replace(/>/g, "&gt;") // HTML escape
            .replace(/(from|import|def|class|return|as|for|in|if|else)/g, '<span class="keyword">$&</span>')
            .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
            .replace(/#.*$/gm, '<span class="comment">$&</span>');
    }

    // --- Initial Load ---
    updateView();
});