// Initialize content analysis
function initContentAnalysis() {
    // Track current page
    const currentUrl = window.location.href;
    const platform = detectPlatform(currentUrl);
    
    // Initialize MutationObserver to watch for content changes
    const observer = new MutationObserver(handleContentChanges);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Add event listeners for user interactions
    attachInteractionListeners();
}

// Detect which social media platform we're on
function detectPlatform(url) {
    if (url.includes('twitter.com')) return 'twitter';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('instagram.com')) return 'instagram';
    return 'unknown';
}

// Handle content changes on the page
function handleContentChanges(mutations) {
    mutations.forEach(mutation => {
        const newNodes = Array.from(mutation.addedNodes);
        newNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Analyze new content
                analyzeContent(node);
            }
        });
    });
}

// Analyze content for improvements
function analyzeContent(element) {
    // Find text input areas and posts
    const textAreas = element.querySelectorAll('textarea, [contenteditable="true"]');
    const posts = element.querySelectorAll('[role="article"]');

    textAreas.forEach(textarea => {
        // Add real-time suggestions
        textarea.addEventListener('input', debounce(async (e) => {
            const text = e.target.value || e.target.textContent;
            const suggestions = await generateSuggestions(text);
            showSuggestions(suggestions, textarea);
        }, 500));
    });

    posts.forEach(post => {
        analyzePost(post);
    });
}

// Analyze individual posts
function analyzePost(post) {
    const textContent = post.textContent;
    const metrics = {
        wordCount: textContent.split(/\s+/).length,
        hashtags: (textContent.match(/#\w+/g) || []).length,
        urls: (textContent.match(/https?:\/\/[^\s]+/g) || []).length,
        mentions: (textContent.match(/@\w+/g) || []).length
    };

    // Send metrics to background script
    chrome.runtime.sendMessage({
        type: 'POST_METRICS',
        data: metrics
    });
}

// Generate content suggestions
async function generateSuggestions(text) {
    const suggestions = {
        improvements: [],
        hashtags: [],
        engagement: []
    };

    // Basic content improvements
    if (text.length < 50) {
        suggestions.improvements.push('Consider adding more detail to increase engagement');
    }
    if (!text.includes('#')) {
        suggestions.improvements.push('Adding relevant hashtags can increase visibility');
    }

    // Generate hashtag suggestions
    const keywords = text
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3);
    
    suggestions.hashtags = keywords
        .map(word => `#${word}`)
        .slice(0, 5);

    // Engagement suggestions
    suggestions.engagement = [
        'Ask a question to encourage responses',
        'Include a call to action',
        'Tag relevant accounts'
    ];

    return suggestions;
}

// Show suggestions UI
function showSuggestions(suggestions, element) {
    // Remove existing suggestions
    const existingSuggestions = document.getElementById('social-assistant-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }

    // Create suggestions container
    const container = document.createElement('div');
    container.id = 'social-assistant-suggestions';
    container.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        margin-top: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 300px;
    `;

    // Add suggestions content
    container.innerHTML = `
        ${suggestions.improvements.length ? `
            <div class="suggestion-section">
                <h4>Improvements</h4>
                <ul>${suggestions.improvements.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
        ` : ''}
        ${suggestions.hashtags.length ? `
            <div class="suggestion-section">
                <h4>Suggested Hashtags</h4>
                <div>${suggestions.hashtags.join(' ')}</div>
            </div>
        ` : ''}
        ${suggestions.engagement.length ? `
            <div class="suggestion-section">
                <h4>Engagement Tips</h4>
                <ul>${suggestions.engagement.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
        ` : ''}
    `;

    // Position the suggestions
    const rect = element.getBoundingClientRect();
    container.style.left = `${rect.left}px`;
    container.style.top = `${rect.bottom + window.scrollY}px`;

    // Add to page
    document.body.appendChild(container);
}

// Attach event listeners for user interactions
function attachInteractionListeners() {
    document.addEventListener('click', e => {
        // Track likes, shares, comments
        if (e.target.closest('[role="button"]')) {
            const button = e.target.closest('[role="button"]');
            const action = detectInteractionType(button);
            if (action) {
                trackInteraction(action);
            }
        }
    });
}

// Detect type of interaction
function detectInteractionType(element) {
    const text = element.textContent.toLowerCase();
    if (text.includes('like')) return 'like';
    if (text.includes('share')) return 'share';
    if (text.includes('comment')) return 'comment';
    return null;
}

// Track user interactions
function trackInteraction(action) {
    chrome.runtime.sendMessage({
        type: 'TRACK_INTERACTION',
        data: {
            action,
            timestamp: new Date().toISOString(),
            url: window.location.href
        }
    });
}

// Utility function to debounce frequent events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Run the initialization function when the content script is injected
initContentAnalysis();
