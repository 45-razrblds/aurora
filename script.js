class BadWordFilter {
    static badWords = new Set([
        // German bad words
        "arsch", "fick", "scheiße", "scheisse", "schwanz", "fotze", "muschi", "penis", "pimmel",
        "bastard", "hure", "nutte", "wichser", "hurensohn", "schlampe", "nazi",
        // English bad words
        "anal", "ass", "fuck", "shit", "bitch", "cunt", "dick", "cock", "pussy", "whore",
        "slut", "bastard", "piss", "penis", "vagina", "nazi"
    ]);

    static replacements = [
        "*beep*", "*meow*", "*yikes*", "*nope*", "*censored*", "*family-friendly*",
        "*butterflies*", "*rainbows*", "*kittens*", "*puppies*", "*unicorns*"
    ];

    static filter(text) {
        if (!text) return text;
        
        const words = text.split(/\b/);
        return words.map(word => {
            const lowerWord = word.toLowerCase();
            if (this.badWords.has(lowerWord)) {
                return this.getRandomReplacement();
            }
            return word;
        }).join('');
    }

    static getRandomReplacement() {
        return this.replacements[Math.floor(Math.random() * this.replacements.length)];
    }
}

class CreprusculumErrHandler {
    static messages = {
        emptyUrl: [
            "empty url",
            "you didnt write anything",
            "are you serious",
            "dude im trying to get away from vibe coding and this is NOT helping"
        ],
        networkError: [
            "network error",
            "sending someone 127.0.0.1 is not a flex you asshole",
            "i hate myself",
            "check your network. fucking hell"
        ],
        invalidFeed: [
            "i dont think this is correct",
            "you dont use JSON for RSS, you use XML. or do you? I dont even know.",
            "TODO: replace this with a funny error message",
            "blablablablablablablablablablablablablablablablabla",
            "invalid feed",
            "invalid feed",
            "invalid feed",
            "invalid feed",
            "invalid feed",
            "invalid feed",
            "invalid feet",
            "invalid feed",
            "invalid feed",
            "TODO: replace this with a coherent error message",
            "invalid feed"
        ],
        emptyFeed: [
            "empty feed",
            "i cant do this anymore",
            "please check if the feed is actually containing something",
            "minimalism plus 1000",
            "feet.... 🤤"
        ],
        parseError: [
            "parsing error",
            "error while parsing",
            "unable to parse",
            "unable to park"
        ],
        cacheError: [
            "i hate everything",
            "Hey ChatGPT, why does this not work?",
            "Hey Gemini, why does this not work?",
            "Hey Copilot, why does this not work?",
        ],
        dateError: [
            "date error",
            "error while dating a person way too young, great job donald trump",
            "dunno when this was published",
            "Time is the continuous progression of existence that occurs in an apparently irreversible succession from the past, through the present, and into the future. It is a component quantity of various measurements used to sequence events, to compare the duration of events (or the intervals between them), and to quantify rates of change of quantities in material reality or in the conscious experience. Time is often referred to as a fourth dimension, along with three spatial dimensions."
        ]
    };

    static getRandomMessage(type) {
        console.error(`Unexpected error type: ${type}`);
        const messages = this.messages[type] || ["i actually have no idea what happened here"];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

class AuroraRSSReader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.initEventListeners();
        this.loadCacheFromStorage();
        this.loadThemePreference();
    }

    initEventListeners() {
        document.getElementById('loadFeed').addEventListener('click', () => this.loadFeed());
        document.getElementById('refreshFeed').addEventListener('click', () => this.refreshFeed());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('rssUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadFeed();
        });
    }

    toggleTheme() {
        const body = document.body;
        const toggle = document.getElementById('themeToggle');
        
        body.classList.toggle('light-mode');
        toggle.classList.toggle('active');
        
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('auroraTheme', isLight ? 'light' : 'dark');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('auroraTheme');
        const toggle = document.getElementById('themeToggle');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            toggle.classList.add('active');
        }
    }

    async loadFeed(forceRefresh = false) {
        const url = document.getElementById('rssUrl').value.trim();
        if (!url) {
            this.showError(CreprusculumErrHandler.getRandomMessage('emptyUrl'));
            this.updateStatus('waiting for you to actually type something...');
            return;
        }

        // Button feedback
        const button = document.getElementById('loadFeed');
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 200);

        this.showLoading(true);
        this.clearError();

        try {
            let feedData = null;
            const cacheKey = url;
            const cachedData = this.cache.get(cacheKey);

            if (!forceRefresh && cachedData && (Date.now() - cachedData.timestamp < this.cacheTimeout)) {
                feedData = cachedData.data;
                this.updateStatus('loaded cache from cache (lol)');
//              this.showError('using cached data, because we are lazy and also it\'s faster so dont complain');
            } else {
                feedData = await this.fetchFeed(url);
                this.cache.set(cacheKey, {
                    data: feedData,
                    timestamp: Date.now()
                });
                this.saveCacheToStorage();
                this.updateStatus('so, because we are lazy and think this is definetely faster and super cool, we have saved this to storage.');
            }

            this.displayFeed(feedData);
        } catch (error) {
            let errorType = error.message.includes('parsing') ? 'parseError' : 'networkError';
            this.showError(CreprusculumErrHandler.getRandomMessage(errorType));
            this.updateStatus('we tried, we failed, such is life...');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchFeed(url) {
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`http ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status !== 'ok') {
            throw new Error(data.message || 'yeah erm this error is unknown so not even WE know what happened here, sorry');
        }

        return data;
    }

    displayFeed(feedData) {
        const feedContent = document.getElementById('feedContent');
        const feedTitle = document.getElementById('feedTitle');
        const feedDescription = document.getElementById('feedDescription');
        const articlesGrid = document.getElementById('articlesGrid');

        feedTitle.textContent = BadWordFilter.filter((feedData.feed.title || 'what even is this feed, why are you torturing me like this?').toLowerCase());
        feedDescription.textContent = BadWordFilter.filter(feedData.feed.description || 'why does this feed not have a description?');

        if (!feedData.items || feedData.items.length === 0) {
            this.showError('this is empty. like... empty. like, there is nothing here. this is a void of endless nothingness. please try another feed.');
            this.updateStatus('why must you torture me like this. crawling through the void of nothingness');
            const articlesGrid = document.getElementById('articlesGrid');
            feedContent.style.display = 'none';
            this.saveCacheToStorage();
            this.cache.delete(feedData.feed.url);
            this.updateStatus('we have deleted this feed from cache, because it\'s empty and we dont want to waste space on that');
            this.showLoading(false);
            return;
        }

        articlesGrid.innerHTML = '';

        feedData.items.forEach(item => {
            const articleCard = this.createArticleCard(item);
            articlesGrid.appendChild(articleCard);
        });

        feedContent.style.display = 'block';
    }

    createArticleCard(item) {
        const card = document.createElement('div');
        card.className = 'article-card';

        const title = document.createElement('h3');
        title.className = 'article-title';
        title.textContent = BadWordFilter.filter(item.title || 'THIS HAS NO TITLE WTF');

        const description = document.createElement('p');
        description.className = 'article-description';
        const cleanDesc = BadWordFilter.filter(this.stripHtml(item.description || item.content || 'great job rss writers, now no one knows what this is about! good job!'));
        description.textContent = cleanDesc.substring(0, 200) + (cleanDesc.length > 200 ? '...' : '');

        const meta = document.createElement('div');
        meta.className = 'article-meta';

        const date = document.createElement('span');
        date.className = 'article-date';
        date.textContent = this.formatDate(item.pubDate);

        const link = document.createElement('a');
        link.className = 'article-link';
        link.href = item.link;
        link.target = '_blank';
        link.textContent = 'read →';

        meta.appendChild(date);
        meta.appendChild(link);

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(meta);

        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                window.open(item.link, '_blank');
            }
        });

        return card;
    }

    stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    formatDate(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            return CreprusculumErrHandler.getRandomMessage('dateError');
        }
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).toLowerCase();
        } catch {
            return CreprusculumErrHandler.getRandomMessage('dateError');
        }
    }

    refreshFeed() {
        const button = document.getElementById('refreshFeed');
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 200);
        
        this.loadFeed(true);
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    clearError() {
        document.getElementById('errorContainer').innerHTML = '';
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    saveCacheToStorage() {
        try {
            const cacheData = Array.from(this.cache.entries());
            localStorage.setItem('auroraCache', JSON.stringify(cacheData));
        } catch (error) {
            this.showError(CreprusculumErrHandler.getRandomMessage('cacheError'));
        }
    }

    loadCacheFromStorage() {
        try {
            const cacheData = localStorage.getItem('auroraCache');
            if (cacheData) {
                const entries = JSON.parse(cacheData);
                this.cache = new Map(entries);
                // Clean expired cache entries
                for (const [key, value] of this.cache.entries()) {
                    if (Date.now() - value.timestamp > this.cacheTimeout) {
                        this.cache.delete(key);
                    }
                }
            }
        } catch (error) {
            // Silently handle cache loading errors
            console.error('Failed to load cache from storage:', error);
            this.cache = new Map();
        }
    }
}

// Initialize Aurora RSS Reader
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode'); // Default to dark mode
    document.getElementById('themeToggle').classList.add('active'); // Default toggle state
    new AuroraRSSReader();
});