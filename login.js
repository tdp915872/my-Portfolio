const loginForm = document.getElementById("loginForm");
const loginId = document.getElementById("loginId");
const loginPassword = document.getElementById("loginPassword");

const USERS = {
  visitor: {
    username: "visitor",
    password: "visitor123",
    role: "visitor",
    displayName: "로그인 방문자",
  },
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin",
    displayName: "관리자",
  },
};

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = loginId.value.trim();
  const password = loginPassword.value.trim();

  const user = USERS[id];

  if (!user || user.password !== password) {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    return;
  }

  localStorage.setItem(
    "portfolio_current_user",
    JSON.stringify({
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    })
  );

  alert(`${user.displayName}으로 로그인되었습니다.`);

  window.location.href = "index.html";
});