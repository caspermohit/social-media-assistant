// Initialize default data on installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Social Media Personalization Assistant installed');
    
    // Initialize storage with default values
    chrome.storage.local.set({
        userMetrics: {
            engagementStats: {
                posts: 0,
                interactions: 0,
                lastActive: new Date().toISOString()
            },
            interests: {},
            history: []
        }
    });
});

// Track user engagement on social media platforms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // List of supported social media domains
    const socialMediaDomains = [
        'twitter.com',
        'facebook.com',
        'instagram.com',
        'linkedin.com'
    ];

    if (changeInfo.status === 'complete' && tab.url) {
        const domain = new URL(tab.url).hostname;
        if (socialMediaDomains.some(site => domain.includes(site))) {
            trackEngagement(domain, tab);
        }
    }
});

// Track user engagement
async function trackEngagement(domain, tab) {
    try {
        // Inject content script to gather engagement data
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: gatherEngagementData
        }, async (results) => {
            if (results && results[0]) {
                const engagementData = results[0].result;
                updateMetrics(domain, engagementData);
            }
        });
    } catch (error) {
        console.error('Error tracking engagement:', error);
    }
}

// Function to gather engagement data (runs in content script context)
function gatherEngagementData() {
    return {
        timestamp: new Date().toISOString(),
        pageTitle: document.title,
        // Track interactions (likes, comments, shares)
        interactions: {
            likes: document.querySelectorAll('[aria-label*="like"], [aria-label*="Like"]').length,
            comments: document.querySelectorAll('[aria-label*="comment"], [aria-label*="Comment"]').length,
            shares: document.querySelectorAll('[aria-label*="share"], [aria-label*="Share"]').length
        },
        // Extract keywords from content
        keywords: Array.from(document.querySelectorAll('p, h1, h2, h3'))
            .map(el => el.textContent)
            .join(' ')
            .toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3)
    };
}

// Update metrics in storage
async function updateMetrics(domain, engagementData) {
    try {
        const data = await chrome.storage.local.get('userMetrics');
        const metrics = data.userMetrics || {};

        // Update engagement stats
        metrics.engagementStats = metrics.engagementStats || {};
        metrics.engagementStats.interactions++;
        metrics.engagementStats.lastActive = new Date().toISOString();

        // Update interests based on keywords
        metrics.interests = metrics.interests || {};
        engagementData.keywords.forEach(keyword => {
            metrics.interests[keyword] = (metrics.interests[keyword] || 0) + 1;
        });

        // Add to history (keep last 100 entries)
        metrics.history = metrics.history || [];
        metrics.history.unshift({
            timestamp: engagementData.timestamp,
            domain: domain,
            title: engagementData.pageTitle,
            interactions: engagementData.interactions
        });
        metrics.history = metrics.history.slice(0, 100);

        // Save updated metrics
        await chrome.storage.local.set({ userMetrics: metrics });

        // Optional: Send analytics or generate recommendations
        generateRecommendations(metrics);
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

// Generate personalized recommendations
function generateRecommendations(metrics) {
    // Sort interests by frequency
    const topInterests = Object.entries(metrics.interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);

    // Store recommendations
    chrome.storage.local.set({
        recommendations: {
            topics: topInterests,
            lastUpdated: new Date().toISOString(),
            suggestions: generateSuggestions(topInterests)
        }
    });
}

// Generate content suggestions based on interests
function generateSuggestions(interests) {
    return interests.map(interest => ({
        topic: interest,
        suggestions: [
            `Consider creating content about #${interest}`,
            `Engage with posts related to ${interest}`,
            `Follow trending discussions about ${interest}`
        ]
    }));
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_METRICS') {
        chrome.storage.local.get('userMetrics', (data) => {
            sendResponse(data.userMetrics);
        });
        return true; // Required for async response
    }
});
