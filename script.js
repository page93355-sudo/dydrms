// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const useFallback = (firebaseConfig.apiKey === "YOUR_API_KEY");

// Improved ID Generator
const generateId = () => {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

const getLocalPosts = () => {
    const posts = localStorage.getItem('school_posts');
    if (!posts) {
        return [
            { id: "sample-1", author: "운영자", email: "admin@school.ac.kr", content: "학교 홈페이지 게시판에 오신 것을 환영합니다! 자유롭게 의견을 남겨주세요.", views: 120, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: "sample-2", author: "김철수", email: "chulsoo@naver.com", content: "이번 축제 라인업이 정말 기대되네요. 다들 같이 가실 분?", views: 45, createdAt: new Date(Date.now() - 3600000).toISOString() }
        ];
    }
    return JSON.parse(posts);
};

const saveLocalPost = (author, email, content, id = null) => {
    let posts = getLocalPosts();
    if (id) {
        // Update existsing
        posts = posts.map(p => p.id === id ? { ...p, author, email, content } : p);
    } else {
        // Create new
        posts.unshift({ 
            id: generateId(), 
            author, email, content, 
            views: 1, 
            createdAt: new Date().toISOString() 
        });
    }
    localStorage.setItem('school_posts', JSON.stringify(posts));
};

const deleteLocalPost = (id) => {
    if (!id) return;
    let posts = getLocalPosts();
    // Strict filter to ensure only the matching ID is removed
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('school_posts', JSON.stringify(posts));
};

// --- Core Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const boardList = document.getElementById('board-list');
    const postForm = document.getElementById('post-form');
    const boardSearch = document.getElementById('board-search');
    const btnPopularPosts = document.getElementById('btn-popular-posts');
    const boardTitle = document.querySelector('.section-title-wrapper-centered h2');
    const modal = document.getElementById('modal-post-form');
    const modalTitle = modal.querySelector('h3');
    const submitBtn = postForm.querySelector('button[type="submit"]');
    
    let allPosts = [];
    let currentView = 'all';
    let editingId = null;

    const openModal = (post = null) => {
        if (post) {
            editingId = post.id;
            modalTitle.innerText = "게시글 수정하기";
            submitBtn.innerText = "수정 완료";
            document.getElementById('post-author').value = post.author;
            document.getElementById('post-email').value = post.email || '';
            document.getElementById('post-content').value = post.content;
        } else {
            editingId = null;
            modalTitle.innerText = "새 글 쓰기";
            submitBtn.innerText = "게시글 등록";
            postForm.reset();
        }
        modal.style.display = "block";
    };

    const renderPosts = (posts) => {
        if (!boardList) return;
        boardList.innerHTML = "";
        
        let filteredPosts = [...posts];
        if (currentView === 'popular') {
            filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            filteredPosts.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
        }

        if (filteredPosts.length === 0) {
            boardList.innerHTML = '<p class="loading">게시글이 없습니다. 첫 번째 글을 남겨보세요!</p>';
            return;
        }

        filteredPosts.forEach((post) => {
            const postEl = document.createElement('div');
            postEl.className = 'post-item slide-up-section is-visible';
            
            let dateStr = '방금 전';
            try {
                const date = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
                dateStr = date.toLocaleDateString();
            } catch(e) {}

            postEl.innerHTML = `
                <div class="post-actions">
                    <button class="action-btn edit" title="수정">✎</button>
                    <button class="action-btn delete" title="삭제">×</button>
                </div>
                <h4>${post.author}님의 글</h4>
                <p>${post.content}</p>
                <small>${post.author} | ${dateStr} | 조회수: ${post.views || 0}</small>
            `;
            
            // Edit Event
            postEl.querySelector('.edit').onclick = () => openModal(post);

            // Delete Event
            postEl.querySelector('.delete').onclick = () => {
                if(confirm("정말 이 게시글을 삭제하시겠습니까?")) {
                    console.log("Deleting post with ID:", post.id);
                    if (!useFallback && typeof firebase !== 'undefined') {
                        firebase.firestore().collection("posts").doc(post.id).delete();
                    } else {
                        deleteLocalPost(post.id);
                        allPosts = getLocalPosts();
                        renderPosts(allPosts);
                    }
                }
            };

            boardList.appendChild(postEl);
        });
    };

    // Initialize Database
    if (!useFallback && typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        postForm.onsubmit = (e) => {
            e.preventDefault();
            const author = document.getElementById('post-author').value;
            const email = document.getElementById('post-email').value;
            const content = document.getElementById('post-content').value;

            if (editingId) {
                db.collection("posts").doc(editingId).update({ author, email, content })
                  .then(() => closeModal());
            } else {
                db.collection("posts").add({
                    author, email, content, views: 1,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => closeModal());
            }
        };

        db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderPosts(allPosts);
        });
    } else {
        allPosts = getLocalPosts();
        renderPosts(allPosts);

        postForm.onsubmit = (e) => {
            e.preventDefault();
            const author = document.getElementById('post-author').value;
            const email = document.getElementById('post-email').value;
            const content = document.getElementById('post-content').value;

            saveLocalPost(author, email, content, editingId);
            closeModal();
            allPosts = getLocalPosts();
            renderPosts(allPosts);
            if (!editingId) boardList.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
    }

    const closeModal = () => {
        modal.style.display = "none";
        postForm.reset();
        editingId = null;
    };

    // UI Events
    document.getElementById('btn-show-form').onclick = () => openModal();
    document.querySelector('.close-btn').onclick = closeModal;
    document.getElementById('btn-cancel-form').onclick = closeModal;
    window.onclick = (e) => { if (e.target == modal) closeModal(); };

    btnPopularPosts.onclick = () => {
        currentView = (currentView === 'all') ? 'popular' : 'all';
        boardTitle.innerText = currentView === 'popular' ? "게시판 (인기순)" : "게시판";
        renderPosts(allPosts);
    };

    boardSearch.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        renderPosts(allPosts.filter(p => p.content.toLowerCase().includes(term) || p.author.toLowerCase().includes(term)));
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-section, .slide-up-section').forEach(el => observer.observe(el));
    
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.accordion-item, .media-container').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const target = document.querySelector(`.${item.getAttribute('data-image')}`);
            if (target) target.classList.add('active');
        });
    });
});
