// Example functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const platformSelect = document.getElementById('platform');
    const postContent = document.getElementById('post-content');
    const analyzeBtn = document.getElementById('analyze-btn');
    const improveBtn = document.getElementById('improve-btn');
    const hashtagBtn = document.getElementById('hashtag-btn');
    const resultsDiv = document.getElementById('results');

    // Analyze Content Button
    analyzeBtn.addEventListener('click', function() {
        const content = postContent.value;
        const platform = platformSelect.value;
        
        if (!content) {
            showResult('Please enter some content to analyze.');
            return;
        }

        // Analyze based on platform guidelines
        const analysis = analyzeContent(content, platform);
        showResult(analysis);
    });

    // Improve Content Button
    improveBtn.addEventListener('click', function() {
        const content = postContent.value;
        const platform = platformSelect.value;

        if (!content) {
            showResult('Please enter some content to improve.');
            return;
        }

        const suggestions = improveSuggestions(content, platform);
        showResult(suggestions);
    });

    // Generate Hashtags Button
    hashtagBtn.addEventListener('click', function() {
        const content = postContent.value;
        const platform = platformSelect.value;

        if (!content) {
            showResult('Please enter content to generate hashtags.');
            return;
        }

        const hashtags = generateHashtags(content, platform);
        showResult(hashtags);
    });

    // Helper Functions
    function showResult(message) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `<p>${message}</p>`;
    }

    function analyzeContent(content, platform) {
        // Basic content analysis
        const wordCount = content.split(/\s+/).length;
        const charCount = content.length;
        
        let analysis = `Analysis for ${platform}:<br>`;
        analysis += `- Word count: ${wordCount}<br>`;
        analysis += `- Character count: ${charCount}<br>`;

        // Platform-specific checks
        switch(platform) {
            case 'twitter':
                analysis += `- Characters remaining: ${280 - charCount}<br>`;
                break;
            case 'linkedin':
                analysis += `- Post length: ${wordCount > 1300 ? 'Too long' : 'Good'}<br>`;
                break;
            case 'instagram':
                analysis += `- Optimal hashtag count: ${content.match(/#/g)?.length || 0}/30<br>`;
                break;
            case 'facebook':
                analysis += `- Post engagement prediction: ${wordCount < 80 ? 'Good' : 'Consider shortening'}<br>`;
                break;
        }

        return analysis;
    }

    function improveSuggestions(content, platform) {
        // Basic improvement suggestions
        let suggestions = 'Suggestions:<br>';
        
        // Check for common improvements
        if (!content.includes('http') && !content.includes('https')) {
            suggestions += '- Consider adding a relevant link<br>';
        }
        
        if (content.split('\n').length < 2) {
            suggestions += '- Consider breaking text into paragraphs for better readability<br>';
        }

        // Platform-specific suggestions
        switch(platform) {
            case 'twitter':
                if (content.length > 280) {
                    suggestions += '- Content exceeds Twitter\'s character limit<br>';
                }
                break;
            case 'linkedin':
                if (!content.includes('#')) {
                    suggestions += '- Consider adding relevant hashtags (3-5 recommended)<br>';
                }
                break;
            case 'instagram':
                if (content.match(/#/g)?.length > 30) {
                    suggestions += '- Too many hashtags (max 30 recommended)<br>';
                }
                break;
        }

        return suggestions;
    }

    function generateHashtags(content, platform) {
        // Extract key words from content
        const words = content.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        // Generate unique hashtags
        const hashtags = [...new Set(words)]
            .slice(0, 5)
            .map(word => '#' + word);

        // Platform-specific hashtag recommendations
        let hashtagSuggestions = 'Suggested Hashtags:<br>';
        hashtagSuggestions += hashtags.join(' ') + '<br><br>';

        switch(platform) {
            case 'instagram':
                hashtagSuggestions += 'Popular Instagram hashtags:<br>#instagood #photooftheday';
                break;
            case 'twitter':
                hashtagSuggestions += 'Trending Twitter hashtags:<br>#trending #viral';
                break;
            case 'linkedin':
                hashtagSuggestions += 'Professional hashtags:<br>#networking #professional';
                break;
        }

        return hashtagSuggestions;
    }
});
