const STORAGE_KEYS = {
  USER: "portfolio_current_user",
  POSTS: "portfolio_posts",
  COMMENTS: "portfolio_comments",
};

const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "나만의 동적 웹앱 포트폴리오",
    category: "portfolio",
    content:
      "HTML, CSS, JavaScript만으로 제작한 동적 포트폴리오 프로토타입입니다. 관리자 권한으로 글을 작성, 수정, 삭제할 수 있고 로그인 방문자는 댓글을 작성할 수 있습니다.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-29",
    owner: "admin",
  },
  {
    id: "post-2",
    title: "AWS 확장 목표 설계",
    category: "cloud",
    content:
      "현재는 localStorage 기반으로 동작하지만 이후 EC2를 리소스 서버로 사용하고, RDS에 글과 댓글 데이터를 저장하며, S3에 이미지 파일을 저장하는 구조로 확장할 예정입니다.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-29",
    owner: "admin",
  },
  {
    id: "post-3",
    title: "권한 분리 기반 댓글 기능",
    category: "web",
    content:
      "비로그인 사용자는 조회만 가능하고, 로그인 방문자는 댓글 작성, 수정, 삭제가 가능합니다. 관리자는 글과 댓글, 업로드 기능을 모두 관리할 수 있도록 설계했습니다.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-29",
    owner: "admin",
  },
];

const DEFAULT_COMMENTS = [
  {
    id: "comment-1",
    writer: "면접관 예시",
    content:
      "권한 구조와 AWS 확장 목표가 명확해서 단순 자기소개 페이지보다 서비스 설계 역량이 잘 보입니다.",
    owner: "visitor",
    createdAt: "2026-05-29",
  },
];

const CATEGORY_LABELS = {
  portfolio: "포트폴리오",
  web: "웹 개발",
  cloud: "클라우드",
  study: "학습 기록",
};

const currentRoleEl = document.getElementById("currentRole");
const loginPageLink = document.getElementById("loginPageLink");
const logoutBtn = document.getElementById("logoutBtn");

const openPostFormBtn = document.getElementById("openPostFormBtn");
const postForm = document.getElementById("postForm");
const postFormTitle = document.getElementById("postFormTitle");
const editingPostId = document.getElementById("editingPostId");
const postTitle = document.getElementById("postTitle");
const postCategory = document.getElementById("postCategory");
const postContent = document.getElementById("postContent");
const postImage = document.getElementById("postImage");
const cancelPostBtn = document.getElementById("cancelPostBtn");
const postList = document.getElementById("postList");

const commentForm = document.getElementById("commentForm");
const commentFormTitle = document.getElementById("commentFormTitle");
const editingCommentId = document.getElementById("editingCommentId");
const commentWriter = document.getElementById("commentWriter");
const commentContent = document.getElementById("commentContent");
const cancelCommentBtn = document.getElementById("cancelCommentBtn");
const commentNotice = document.getElementById("commentNotice");
const commentList = document.getElementById("commentList");

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || {
    role: "guest",
    username: "비로그인",
  };
}

function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function getPosts() {
  const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS));

  if (!posts) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    return DEFAULT_POSTS;
  }

  return posts;
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getComments() {
  const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS));

  if (!comments) {
    localStorage.setItem(
      STORAGE_KEYS.COMMENTS,
      JSON.stringify(DEFAULT_COMMENTS)
    );
    return DEFAULT_COMMENTS;
  }

  return comments;
}

function saveComments(comments) {
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
}

function isAdmin() {
  return getCurrentUser().role === "admin";
}

function isVisitor() {
  return getCurrentUser().role === "visitor";
}

function isLoggedIn() {
  return isAdmin() || isVisitor();
}

function canDeletePost(post) {
  const user = getCurrentUser();

  if (user.role === "admin") {
    return true;
  }

  if (user.role === "visitor" && post.owner === user.username) {
    return true;
  }

  return false;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readImageFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

function updateAuthUI() {
  const user = getCurrentUser();

  if (user.role === "admin") {
    currentRoleEl.textContent = "관리자";
    currentRoleEl.className = "role-badge admin";
    loginPageLink.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    openPostFormBtn.classList.remove("hidden");
    commentForm.classList.remove("hidden");

    commentNotice.textContent =
      "관리자는 글과 댓글을 모두 관리할 수 있습니다.";
  } else if (user.role === "visitor") {
    currentRoleEl.textContent = "로그인 방문자";
    currentRoleEl.className = "role-badge visitor";
    loginPageLink.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    openPostFormBtn.classList.add("hidden");
    postForm.classList.add("hidden");
    commentForm.classList.remove("hidden");

    commentWriter.value = user.username || "방문자";

    commentNotice.textContent =
      "로그인 방문자는 댓글 작성, 수정, 삭제가 가능합니다.";
  } else {
    currentRoleEl.textContent = "비로그인";
    currentRoleEl.className = "role-badge";
    loginPageLink.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    openPostFormBtn.classList.add("hidden");
    postForm.classList.add("hidden");
    commentForm.classList.add("hidden");

    commentNotice.textContent =
      "비로그인 방문자는 글과 댓글 조회만 가능합니다.";
  }
}

function renderPosts() {
  const posts = getPosts();

  if (posts.length === 0) {
    postList.innerHTML = `
      <div class="empty-box">
        아직 등록된 프로젝트 글이 없습니다.
      </div>
    `;
    return;
  }

  postList.innerHTML = posts
    .map((post) => {
      const canDelete = canDeletePost(post);

      const postButtons = canDelete
        ? `
          <div class="post-actions">
            ${
              isAdmin()
                ? `
                <button class="btn small" type="button" onclick="editPost('${post.id}')">
                  수정
                </button>
              `
                : ""
            }

            <button class="btn small danger" type="button" onclick="deletePost('${post.id}')">
              삭제
            </button>
          </div>
        `
        : "";

      return `
        <article class="post-card">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)} 이미지" />

          <div class="post-body">
            <span class="post-category">
              ${CATEGORY_LABELS[post.category] || "프로젝트"}
            </span>

            <h3>${escapeHtml(post.title)}</h3>

            <p>${escapeHtml(post.content)}</p>

            <small>작성일: ${escapeHtml(post.createdAt)}</small>

            ${postButtons}
          </div>
        </article>
      `;
    })
    .join("");
}

function editPost(postId) {
  if (!isAdmin()) {
    alert("관리자만 글을 수정할 수 있습니다.");
    return;
  }

  const post = getPosts().find((item) => item.id === postId);

  if (!post) return;

  editingPostId.value = post.id;
  postFormTitle.textContent = "프로젝트 글 수정";
  postTitle.value = post.title;
  postCategory.value = post.category;
  postContent.value = post.content;
  postImage.value = "";

  postForm.classList.remove("hidden");
  postForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deletePost(postId) {
  const post = getPosts().find((item) => item.id === postId);

  if (!post) return;

  if (!canDeletePost(post)) {
    alert("삭제 권한이 없습니다.");
    return;
  }

  const ok = confirm("정말 이 글을 삭제할까요?");

  if (!ok) return;

  const posts = getPosts().filter((item) => item.id !== postId);

  savePosts(posts);
  renderPosts();
}

async function handlePostSubmit(event) {
  event.preventDefault();

  if (!isAdmin()) {
    alert("관리자만 글을 저장할 수 있습니다.");
    return;
  }

  const posts = getPosts();
  const id = editingPostId.value;
  const file = postImage.files[0];
  const imageData = await readImageFile(file);

  if (id) {
    const updatedPosts = posts.map((post) => {
      if (post.id !== id) return post;

      return {
        ...post,
        title: postTitle.value.trim(),
        category: postCategory.value,
        content: postContent.value.trim(),
        image: imageData || post.image,
        owner: post.owner || "admin",
      };
    });

    savePosts(updatedPosts);
  } else {
    const user = getCurrentUser();

    const newPost = {
      id: makeId("post"),
      title: postTitle.value.trim(),
      category: postCategory.value,
      content: postContent.value.trim(),
      image:
        imageData ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      createdAt: today(),
      owner: user.username || "admin",
    };

    savePosts([newPost, ...posts]);
  }

  editingPostId.value = "";
  postFormTitle.textContent = "프로젝트 글 작성";
  postForm.reset();
  postForm.classList.add("hidden");

  renderPosts();
}

function resetCommentForm() {
  editingCommentId.value = "";
  commentFormTitle.textContent = "댓글 작성";
  commentContent.value = "";

  const user = getCurrentUser();

  if (isLoggedIn()) {
    commentWriter.value = user.username || "";
  } else {
    commentWriter.value = "";
  }
}

function canManageComment(comment) {
  const user = getCurrentUser();

  if (user.role === "admin") {
    return true;
  }

  if (user.role === "visitor" && comment.owner === user.username) {
    return true;
  }

  return false;
}

function renderComments() {
  const comments = getComments();

  if (comments.length === 0) {
    commentList.innerHTML = `
      <div class="empty-box">
        아직 댓글이 없습니다.
      </div>
    `;
    return;
  }

  commentList.innerHTML = comments
    .map((comment) => {
      const buttons = canManageComment(comment)
        ? `
          <div class="comment-actions">
            <button class="btn small" type="button" onclick="editComment('${comment.id}')">
              수정
            </button>
            <button class="btn small danger" type="button" onclick="deleteComment('${comment.id}')">
              삭제
            </button>
          </div>
        `
        : "";

      return `
        <article class="comment-card">
          <strong>${escapeHtml(comment.writer)}</strong>

          <p>${escapeHtml(comment.content)}</p>

          <small>작성일: ${escapeHtml(comment.createdAt)}</small>

          ${buttons}
        </article>
      `;
    })
    .join("");
}

function editComment(commentId) {
  const comment = getComments().find((item) => item.id === commentId);

  if (!comment) return;

  if (!canManageComment(comment)) {
    alert("본인 댓글만 수정할 수 있습니다.");
    return;
  }

  editingCommentId.value = comment.id;
  commentFormTitle.textContent = "댓글 수정";
  commentWriter.value = comment.writer;
  commentContent.value = comment.content;

  commentForm.classList.remove("hidden");
  commentForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteComment(commentId) {
  const comment = getComments().find((item) => item.id === commentId);

  if (!comment) return;

  if (!canManageComment(comment)) {
    alert("본인 댓글만 삭제할 수 있습니다.");
    return;
  }

  const ok = confirm("정말 이 댓글을 삭제할까요?");

  if (!ok) return;

  const comments = getComments().filter((item) => item.id !== commentId);

  saveComments(comments);
  renderComments();
}

function handleCommentSubmit(event) {
  event.preventDefault();

  if (!isLoggedIn()) {
    alert("로그인 후 댓글을 작성할 수 있습니다.");
    return;
  }

  const comments = getComments();
  const id = editingCommentId.value;
  const user = getCurrentUser();

  if (id) {
    const targetComment = comments.find((comment) => comment.id === id);

    if (!targetComment || !canManageComment(targetComment)) {
      alert("댓글 수정 권한이 없습니다.");
      return;
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id !== id) return comment;

      return {
        ...comment,
        writer: commentWriter.value.trim(),
        content: commentContent.value.trim(),
      };
    });

    saveComments(updatedComments);
  } else {
    const newComment = {
      id: makeId("comment"),
      writer: commentWriter.value.trim(),
      content: commentContent.value.trim(),
      owner: user.role === "admin" ? "admin" : user.username,
      createdAt: today(),
    };

    saveComments([newComment, ...comments]);
  }

  resetCommentForm();
  renderComments();
}

function handleLogout() {
  saveCurrentUser({
    role: "guest",
    username: "비로그인",
  });

  updateAuthUI();
  renderPosts();
  renderComments();
  renderContacts();
}

openPostFormBtn?.addEventListener("click", () => {
  editingPostId.value = "";
  postFormTitle.textContent = "프로젝트 글 작성";
  postForm.reset();
  postForm.classList.remove("hidden");
});

cancelPostBtn?.addEventListener("click", () => {
  editingPostId.value = "";
  postFormTitle.textContent = "프로젝트 글 작성";
  postForm.reset();
  postForm.classList.add("hidden");
});

postForm?.addEventListener("submit", handlePostSubmit);

cancelCommentBtn?.addEventListener("click", () => {
  resetCommentForm();
});

commentForm?.addEventListener("submit", handleCommentSubmit);

logoutBtn?.addEventListener("click", handleLogout);

/* CONTACT */

const CONTACT_STORAGE_KEY = "portfolio_contacts";

const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");
const contactEmail = document.getElementById("contactEmail");
const contactMessage = document.getElementById("contactMessage");
const contactResult = document.getElementById("contactResult");

function getContacts() {
  return JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY)) || [];
}

function saveContacts(contacts) {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
}

function canViewContacts() {
  const user = getCurrentUser();

  return user.role === "admin" || user.role === "visitor";
}

function renderContacts() {
  if (!contactResult) return;

  if (!canViewContacts()) {
    contactResult.classList.add("hidden");
    contactResult.innerHTML = "";
    return;
  }

  const contacts = getContacts();

  contactResult.classList.remove("hidden");

  if (contacts.length === 0) {
    contactResult.innerHTML = `
      <div class="empty-box">
        아직 등록된 연락처가 없습니다.
      </div>
    `;
    return;
  }

  contactResult.innerHTML = contacts
    .map((contact) => {
      return `
        <div class="contact-save-card">
          <strong>${escapeHtml(contact.name)}</strong>

          <a
            class="contact-phone-link"
            href="tel:${escapeHtml(contact.phone)}"
          >
            ${escapeHtml(contact.phone)}
          </a>

          ${contact.email ? `<p>${escapeHtml(contact.email)}</p>` : ""}

          <p>${escapeHtml(contact.message)}</p>

          <small>
            등록일: ${escapeHtml(contact.createdAt)}
          </small>
        </div>
      `;
    })
    .join("");
}

contactForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = contactName.value.trim();
  const phone = contactPhone.value.trim();
  const email = contactEmail.value.trim();
  const message = contactMessage.value.trim();

  if (!name || !phone || !message) {
    alert("이름, 전화번호, 문의 내용을 입력하세요.");
    return;
  }

  const contacts = getContacts();

  const newContact = {
    id: `contact-${Date.now()}`,
    name,
    phone,
    email,
    message,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  contacts.unshift(newContact);

  saveContacts(contacts);

  contactForm.reset();

  renderContacts();

  alert("연락처가 저장되었습니다.");
});

updateAuthUI();
renderPosts();
renderComments();
renderContacts();