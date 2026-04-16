// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Hero Animations
gsap.from(".reveal-text", {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out"
});

gsap.from(".fade-in", {
    opacity: 0,
    y: 20,
    stagger: 0.2,
    duration: 1,
    delay: 0.5,
    ease: "power3.out"
});

// Section Parallax & Reveals
const sections = document.querySelectorAll('.v-section');

sections.forEach((section) => {
    const title = section.querySelector('h2');
    const content = section.querySelector('p');
    const visual = section.querySelector('.visual-box');
    
    if (title) {
        gsap.from(title, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
            },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    }

    if (content) {
        gsap.from(content, {
            scrollTrigger: {
                trigger: section,
                start: "top 75%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: "power2.out"
        });
    }

    if (visual) {
        gsap.from(visual, {
            scrollTrigger: {
                trigger: section,
                start: "top 70%",
                onEnter: () => {
                    const mask = visual.querySelector('.reveal-mask');
                    if (mask) mask.classList.add('active');
                }
            },
            scale: 0.9,
            opacity: 0,
            duration: 1.5,
            ease: "expo.out"
        });
    }
});

// Particle Network Background (Grand Aesthetic)
const canvas = document.getElementById('particleCanvas');
const cursor = document.querySelector('.cursor-follower');
const scrollBar = document.getElementById('scrollBar');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    
    function resize() {
        canvas.width = window.innerWidth;
        const heroSection = document.getElementById('hero');
        canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Update Custom Cursor
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    window.addEventListener('mousedown', () => cursor && cursor.classList.add('active'));
    window.addEventListener('mouseup', () => cursor && cursor.classList.remove('active'));

    // Scroll Progress
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollBar) scrollBar.style.width = scrolled + "%";
    });
    
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                    this.x -= dx * 0.05;
                    this.y -= dy * 0.05;
                }
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(14, 165, 233, ${(1 - distance / 150) * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Hero Robot Parallax
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) / 50;
        const y = (e.clientY - window.innerHeight / 2) / 50;
        
        gsap.to(heroVisual, {
            x: x,
            y: y,
            duration: 1,
            ease: "power2.out"
        });
    });
}

// Hover effect for Mastery Section
const explodedView = document.querySelector('.exploded-view');
if (explodedView) {
    explodedView.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = explodedView.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        gsap.to(explodedView.querySelector('img'), {
            rotateY: x * 10,
            rotateX: -y * 10,
            duration: 0.5,
            ease: "power2.out"
        });
    });
    
    explodedView.addEventListener('mouseleave', () => {
        gsap.to(explodedView.querySelector('img'), {
            rotateY: 0,
            rotateX: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });
    });
}

// Nav backdrop on scroll
ScrollTrigger.create({
    start: "top -80",
    onUpdate: (self) => {
        const nav = document.querySelector('.glass-nav');
        if (self.direction === 1) {
            gsap.to(nav, { y: -100, duration: 0.3 });
        } else {
            gsap.to(nav, { y: 0, opacity: 1, duration: 0.3, background: "rgba(2, 6, 23, 0.8)" });
        }
    }
});

// Skill Bars Animation
const skillBars = document.querySelectorAll('.skill-progress');
skillBars.forEach((bar) => {
    gsap.from(bar, {
        scrollTrigger: {
            trigger: bar,
            start: "top 90%",
        },
        width: 0,
        duration: 2,
        ease: "power4.out"
    });
});

// --- Free Board LocalStorage Logic ---
const STORAGE_KEY = 'amk_board_posts';

// Global access functions
window.toggleWriteForm = function() {
    const boardFormContainer = document.getElementById('boardFormContainer');
    const boardForm = document.getElementById('boardForm');
    const editPostId = document.getElementById('editPostId');
    const formTitle = document.getElementById('formTitle');
    const btnSubmitPost = document.getElementById('btnSubmitPost');

    if (!boardFormContainer) return;
    
    // Check current display via computed style if needed, but simpler:
    const isHidden = boardFormContainer.style.display === 'none' || boardFormContainer.style.display === '';
    
    if (isHidden) {
        boardFormContainer.style.display = 'block';
        if (boardForm) boardForm.reset();
        if (editPostId) editPostId.value = '';
        if (formTitle) formTitle.textContent = '새 글 쓰기';
        if (btnSubmitPost) btnSubmitPost.textContent = '게시글 등록';
        boardFormContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        boardFormContainer.style.display = 'none';
    }
};

window.editPost = function(id) {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    const boardFormContainer = document.getElementById('boardFormContainer');
    const editPostId = document.getElementById('editPostId');
    const formTitle = document.getElementById('formTitle');
    const btnSubmitPost = document.getElementById('btnSubmitPost');

    if (boardFormContainer) boardFormContainer.style.display = 'block';
    
    document.getElementById('boardName').value = post.name;
    document.getElementById('boardEmail').value = post.email;
    document.getElementById('boardContent').value = post.content;
    if (editPostId) editPostId.value = post.id;
    
    if (formTitle) formTitle.textContent = '게시글 수정하기';
    if (btnSubmitPost) btnSubmitPost.textContent = '수정 완료';
    
    if (boardFormContainer) boardFormContainer.scrollIntoView({ behavior: 'smooth' });
};

window.deletePost = function(id) {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    renderPosts(posts);
};

window.addReply = function(e, postId) {
    e.preventDefault();
    const form = e.target;
    if (!form) return;

    const nameVal = form.replyName ? form.replyName.value.trim() : '';
    const contentVal = form.replyContent ? form.replyContent.value.trim() : '';
    
    if (!nameVal || !contentVal) return;
    
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        if (!posts[postIndex].replies) posts[postIndex].replies = [];
        posts[postIndex].replies.push({
            name: nameVal,
            content: contentVal,
            date: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        renderPosts(posts);
    }
    form.reset();
};

function renderPosts(posts) {
    const boardList = document.getElementById('boardList');
    if (!boardList) return;
    boardList.innerHTML = '';
    
    if (posts.length === 0) {
        boardList.innerHTML = '<p style="text-align:center; color:gray; padding: 2rem 0;">아직 등록된 게시글이 없습니다. 첫 글을 남겨보세요!</p>';
        return;
    }
    
    posts.slice().reverse().forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post-item';
        
        let repliesHtml = '';
        if (post.replies && post.replies.length > 0) {
            repliesHtml = `<div class="replies-container">`;
            post.replies.forEach(reply => {
                repliesHtml += `
                    <div class="reply-item">
                        <div class="reply-header">
                            <strong>${escapeHTML(reply.name)}</strong>
                            <span>${formatDate(reply.date)}</span>
                        </div>
                        <div class="reply-content">${escapeHTML(reply.content)}</div>
                    </div>
                `;
            });
            repliesHtml += `</div>`;
        }
        
        postEl.innerHTML = `
            <div class="post-header">
                <div><strong>${escapeHTML(post.name)}</strong> <span style="font-size:0.8em; margin-left:10px; color:var(--text-gray);">${escapeHTML(post.email)}</span></div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <div class="post-actions">
                        <button class="action-btn" onclick="editPost('${post.id}')"><i data-lucide="edit-3" style="width:14px;"></i> 수정</button>
                        <button class="action-btn delete" onclick="deletePost('${post.id}')"><i data-lucide="trash-2" style="width:14px;"></i> 삭제</button>
                    </div>
                    <span>${formatDate(post.date)}</span>
                </div>
            </div>
            <div class="post-content">${escapeHTML(post.content)}</div>
            ${repliesHtml}
            <form class="reply-form" onsubmit="addReply(event, '${post.id}')">
                <input type="text" name="replyName" placeholder="답글 작성자" required>
                <input type="text" name="replyContent" placeholder="답글 내용" required style="flex: 2 1 300px;">
                <button type="submit">답글 달기</button>
            </form>
        `;
        boardList.appendChild(postEl);
    });
    
    if (window.lucide) window.lucide.createIcons();
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// Handle Form Submit (Both Create and Update)
window.submitBoard = function(e) {
    if (e) e.preventDefault();
    
    const boardForm = document.getElementById('boardForm');
    const nameVal = document.getElementById('boardName').value.trim();
    const emailVal = document.getElementById('boardEmail').value.trim();
    const contentVal = document.getElementById('boardContent').value.trim();
    const idVal = document.getElementById('editPostId') ? document.getElementById('editPostId').value : '';
    
    if (!nameVal || !emailVal || !contentVal) {
        alert('이름, 이메일, 내용을 모두 입력해 주세요.');
        return;
    }
    
    let posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (idVal) {
        const idx = posts.findIndex(p => p.id === idVal);
        if (idx !== -1) {
            posts[idx].name = nameVal;
            posts[idx].email = emailVal;
            posts[idx].content = contentVal;
            posts[idx].date = new Date().toISOString();
        }
    } else {
        posts.push({
            id: '_' + Math.random().toString(36).substr(2, 9),
            name: nameVal,
            email: emailVal,
            content: contentVal,
            date: new Date().toISOString(),
            replies: []
        });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    renderPosts(posts);
    if (boardForm) boardForm.reset();
    window.toggleWriteForm(); // Hide form after submission
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const initialPosts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    renderPosts(initialPosts);
});

window.sendEmail = function(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    if (!name || !email || !message) {
        alert('모든 양식을 작성해 주세요.');
        return;
    }

    const subject = encodeURIComponent(`[문의] 피지컬 AI 포트폴리오 상담 요청 - ${name}`);
    const body = encodeURIComponent(`보낸 사람: ${name}\n이메일: ${email}\n\n내용:\n${message}`);
    
    const mailtoUrl = `mailto:1234@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
};
