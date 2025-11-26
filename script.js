let allData = [];
const featuredGames = ["gta-sa-mod-v", "racing-master", "minecraft-mod", "war-thunder"];
const recommendedGames = ["fifa16-mod", "mortal-kombat-x", "poppy-playtime", "subway-surfers-mod", "nulls-brawl", "clash-royale-mod", "dude-theft-wars", "real-racing-mod", "world-cricket-mod", "hungry-shark-mod"];

document.addEventListener('DOMContentLoaded', () => {
    // Inject Animation Style
    const style = document.createElement('style');
    style.textContent = `@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`;
    document.head.appendChild(style);

    // Mode Toggle
    const toggle = document.getElementById('mode-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // Data Loading
    fetch('games.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            loadPopularGames();
            loadRecommendedGames();
            window.filterCategory('game');
        })
        .catch(error => console.error('Error loading data:', error));
    
    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allData.filter(item => item.title.toLowerCase().includes(term) || item.genre.toLowerCase().includes(term));
        const activeTab = document.querySelector('.tab-btn.active');
        const currentCategory = activeTab && activeTab.textContent.toLowerCase().includes('program') ? 'app' : 'game';
        const categoryFiltered = filtered.filter(item => item.category === currentCategory);
        displayGrid(categoryFiltered);
    });

    // Category Filtering
    window.filterCategory = function(category) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.textContent.toLowerCase().includes(category === 'app' ? 'program' : 'game'));
        if (targetBtn) targetBtn.classList.add('active');

        const filtered = allData.filter(item => item.category === category);
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const searchFiltered = filtered.filter(item => item.title.toLowerCase().includes(searchTerm) || item.genre.toLowerCase().includes(searchTerm));
        displayGrid(searchFiltered);
    }

    // Load Popular (Vertical Cards)
    function loadPopularGames() {
        const list = document.getElementById('popular-carousel');
        list.innerHTML = '';
        const popularItems = featuredGames.map(id => allData.find(item => item.id === id)).filter(item => item);
        popularItems.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('popular-card');
            card.innerHTML = `
                <img src="${item.icon}" alt="${item.title} Icon">
                <div class="popular-info">
                    <h4>${item.title}</h4>
                    <p>${(item.total_downloads / 1000000).toFixed(1)}M+ Downloads</p>
                </div>
            `;
            card.addEventListener('click', () => openModal(item));
            list.appendChild(card);
        });
    }

    // Load Recommended (Banner Style)
    function loadRecommendedGames() {
        const list = document.getElementById('recommended-banner');
        list.innerHTML = '';
        const recommendedItems = recommendedGames.map(id => allData.find(item => item.id === id)).filter(item => item);
        recommendedItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('banner-item');
            card.style.animation = `slideInRight 0.5s ease-out ${index * 0.1}s forwards`;
            card.style.opacity = 0;
            card.innerHTML = `
                <div class="banner-item-info">
                    <h4>${item.title}</h4>
                    <span>${item.genre} | ${item.rating.toFixed(1)} Stars</span>
                </div>
                <img src="${item.icon}" alt="${item.title} Icon">
            `;
            card.addEventListener('click', () => openModal(item));
            list.appendChild(card);
        });
    }

    // Load Main Grid (Horizontal Cards)
    function displayGrid(items) {
        const grid = document.getElementById('content-grid');
        grid.innerHTML = '';
        if (items.length === 0) {
            grid.innerHTML = '<p class="no-results-message" style="grid-column:1/-1;text-align:center;">No results found.</p>';
            return;
        }
        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${item.icon}" alt="${item.title} Icon">
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="card-meta">
                        <span class="card-genre">${item.genre}</span>
                    </div>
                    <div class="card-rating">${getStars(item.rating)} <span>(${item.rating.toFixed(1)})</span></div>
                </div>
            `;
            card.addEventListener('click', () => openModal(item));
            grid.appendChild(card);
        });
    }

    // Modal Logic
    const modal = document.getElementById('detail-modal');
    document.querySelector('.close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    function openModal(item) {
        document.body.classList.add('modal-open');
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-updated').textContent = item.updated;
        document.getElementById('modal-version').textContent = item.version;
        document.getElementById('modal-requirements').textContent = item.requirements;
        document.getElementById('modal-genre').textContent = item.genre;
        document.getElementById('modal-price').textContent = item.price;
        document.getElementById('modal-installs-count').textContent = `| ${(item.total_downloads / 1000000).toFixed(1)}M+ Downloads`;
        document.getElementById('modal-rating-stars').innerHTML = getStars(item.rating);
        document.getElementById('modal-rating-value').textContent = `(${item.rating.toFixed(1)})`;
        document.getElementById('modal-desc').textContent = item.description;

        const screenshotContainer = document.getElementById('modal-screenshots');
        screenshotContainer.innerHTML = '';
        (item.screenshots || []).forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            screenshotContainer.appendChild(img);
        });

        document.getElementById('btn-android').href = item.downloads.android || '#';
        document.getElementById('btn-ios').href = item.downloads.ios || '#';

        const commentsSection = document.getElementById('modal-comments');
        commentsSection.innerHTML = '';
        const comments = item.comments || [];
        if (comments.length > 0) {
            document.getElementById('comments-title').style.display = 'block';
            comments.forEach(comment => {
                const div = document.createElement('div');
                div.classList.add('comment');
                div.innerHTML = `<strong>${comment.user}</strong><p>${comment.text}</p>`;
                commentsSection.appendChild(div);
            });
        } else {
            document.getElementById('comments-title').style.display = 'none';
        }
        modal.style.display = 'flex';
    }

    function getStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) stars += '<i class="fas fa-star"></i>';
            else if (i === fullStars && hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
            else stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }
});