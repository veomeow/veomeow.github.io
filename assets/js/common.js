var baseurl = document.querySelector('meta[name="baseurl"]').content;

document.addEventListener('DOMContentLoaded', function(){
    const themeButton = document.querySelector('.btn-theme');
    function updateThemeButton() {
        const dark = document.documentElement.dataset.theme === 'dark';
        themeButton.setAttribute('aria-pressed', String(dark));
        themeButton.setAttribute('aria-label', dark ? '라이트 모드 켜기' : '다크 모드 켜기');
        themeButton.setAttribute('title', dark ? '라이트 모드 전환' : '다크 모드 전환');
        themeButton.querySelector('span').textContent = dark ? '☀' : '☾';
        document.querySelector('meta[name="theme-color"]').content = dark ? '#101E18' : '#FBFAF6';
    }
    updateThemeButton();
    themeButton.addEventListener('click', function() {
        const dark = document.documentElement.dataset.theme !== 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (error) { /* Theme still works for this page. */ }
        updateThemeButton();
    });

    // navigation (mobile)
    var siteNav = document.querySelector('#navigation');
    var siteContact = document.querySelector('#contact');
    var menuButton = document.querySelector("#btn-nav");

    menuButton.addEventListener('click', function() {
        if (menuButton.classList.toggle('nav-open')) {
            siteNav.classList.add('nav-open');
            siteContact.classList.add('contact-open');
        } else {
            siteNav.classList.remove('nav-open');
            siteContact.classList.remove('contact-open');
        }
    });

    // kept nav opened
    var firstNavs = document.querySelectorAll('.nav-first');
    var page_path = decodeURIComponent(window.location.pathname);
    page_path = page_path.replace(baseurl, "");
    var page_tree = page_path.split('/');

    Array.prototype.forEach.call(firstNavs, function (nav_first) {
        if (page_tree[1] === nav_first.dataset.path){
            nav_first.classList.add('active');

            var secondNavs = nav_first.querySelectorAll('.nav-second');

            Array.prototype.forEach.call(secondNavs, function (nav_second) {
                if (page_tree[2] === nav_second.dataset.path){
                    nav_second.classList.toggle('active');

                    var thirdNavs = nav_second.querySelectorAll('.nav-third');

                    Array.prototype.forEach.call(thirdNavs, function (nav_third) {
                        if (page_tree[3] === nav_third.dataset.path){
                            nav_third.classList.toggle('active');
                        }
                    });
                }
            });
        }
    });

    // navigation (toogle sub-category)
    document.addEventListener('click', function(e){
        var target = e.target;

        while (target && !(target.classList && target.classList.contains('nav-list-expander'))) {
            target = target.parentNode;
        }

        if (target) {
            e.preventDefault();
            var nav_item = target.parentNode;
            target.ariaPressed = nav_item.parentNode.classList.toggle('active');
        }
    });

    document.querySelectorAll('.nav-item').forEach((nav_item) => {
        if (nav_item.parentNode.classList.contains('active')){
            nav_item.classList.add('selected');
        }
        else {
            nav_item.classList.remove('selected');
        }
    });

    const searchInput = document.getElementById('search-input');
    const searchPanel = document.getElementById('search');
    document.querySelectorAll('.btn-search').forEach(function(button) {
        button.addEventListener('click', function() {
            if (window.matchMedia('(max-width: 1024px)').matches) searchPanel.classList.toggle('search-open');
            if (!searchPanel.classList.contains('search-open') && window.matchMedia('(max-width: 1024px)').matches) return;
            searchInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
            searchInput.focus({ preventScroll: true });
        });
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && searchPanel.classList.contains('search-open')) {
            searchPanel.classList.remove('search-open');
            document.querySelector('.side-banner .btn-search').focus();
        }
    });
    document.getElementById('btn-clear').addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    });
});

function searchPost(pages){
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-result');
    const clear = document.getElementById('btn-clear');

    input.addEventListener('input', function() {
        const keyword = input.value.trim().toLocaleLowerCase();
        results.replaceChildren();
        results.hidden = keyword.length === 0;
        clear.hidden = keyword.length === 0;
        if (!keyword) return;

        const matches = pages.filter(function(page) {
            if (page.title === 'Home' && page.type === 'category') return false;
            return [page.title, page.path, page.tags].some(function(value) {
                return String(value || '').toLocaleLowerCase().includes(keyword);
            });
        }).sort(function(a, b) {
            return (a.type === 'category') - (b.type === 'category');
        }).slice(0, 20);

        if (!matches.length) {
            const item = document.createElement('li');
            item.className = 'search-empty';
            item.textContent = '검색 결과가 없습니다.';
            results.append(item);
            return;
        }

        matches.forEach(function(page) {
            const item = document.createElement('li');
            item.className = 'result-item';
            const link = document.createElement('a');
            link.href = page.url;
            const title = document.createElement('strong');
            title.textContent = page.title;
            const path = document.createElement('small');
            path.textContent = page.path || 'Home';
            link.append(title, path);
            item.append(link);
            results.append(item);
        });
    });
}

function searchRelated(pages){
    const refBox = document.getElementById('related-box');
    const refResults = document.getElementById('related-posts');

    if (!refBox) return;

    var relatedPosts = [];
    var currPost = pages.find(obj => {return obj.url === location.pathname});

    let currTags = currPost.tags.split(', ');
    let currCategory = currPost.path.split(' > ').pop();

    for (var i = 0; i < pages.length; i++) {
        let page = pages[i];

        if (page.type === 'category') continue;

        if (page.title === currPost.title) continue;

        let tags = page.tags.split(', ');
        let category = page.path.split(' > ').pop();
        let correlationScore = 0;

        for (var j = 0; j < currTags.length; j++){
            if (tags.indexOf(currTags[j]) != -1) correlationScore += 1;
        }

        if (category === currCategory) correlationScore += 1;

        if (correlationScore == 0) continue;

        relatedPosts.push({
            'title': page.title,
            'date': page.date,
            'category': category,
            'url': page.url,
            'thumbnail': page.image,
            'score': correlationScore
        });
    }

    relatedPosts.sort(function (a, b) {
        if(a.hasOwnProperty('score')){
            return b.score - a.score;
        }
    });

    if (relatedPosts.length == 0){
        refBox.style.display = 'none';
        return;
    }

    for (var i = 0; i < Math.min(relatedPosts.length, 6); i++){
        let post = relatedPosts[i];
        let date = '-';
        let category = 'No category';

        if (post.date !== '1900-01-01'){
            date = new Date(post.date);
            date = date.toLocaleString('en-US', {day: 'numeric', month:'long', year:'numeric'});
        }

        if (post.category !== '') category = post.category;

        let contents = document.createElement("li");
        contents.classList.add("related-item");
        contents.innerHTML = '<a href="' + post.url +
            '"><img src="' + post.thumbnail + 
            '"/><p class="category">' + category +  
            '</p><p class="title">' + post.title + 
            '</p><p class="date">' + date +
            '</p></a>';

        refResults.append(contents);
    }
}
