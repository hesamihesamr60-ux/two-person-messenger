
const socket = io();

const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const form = document.getElementById("messageForm");

let username = "";
const displayedIds = new Set();

function startChat() {
  const savedName = prompt("اسمت رو وارد کن:");
  username = (savedName || "کاربر").trim().slice(0, 30) || "کاربر";
  socket.emit("join", username);
}

function addMessage(message) {
  if (message.id != null) {
    if (displayedIds.has(message.id)) return;
    displayedIds.add(message.id);
  }

  const div = document.createElement("div");
  div.className =
    "message " + (message.username === username ? "mine" : "theirs");

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = message.username;

  const text = document.createElement("div");
  text.textContent = message.text;

  div.appendChild(name);
  div.appendChild(text);
  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
}

async function loadMessages() {
  try {
    const response = await fetch("/api/messages");
    if (!response.ok) throw new Error("دریافت پیام‌ها ناموفق بود");

    const oldMessages = await response.json();
    messages.replaceChildren();
    displayedIds.clear();

    oldMessages.forEach(addMessage);
  } catch (error) {
    console.error(error);
  }
}

function sendMessage() {
  const text = input.value.trim();
  if (!text || !socket.connected) return;

  socket.emit("sendMessage", text);
  input.value = "";
  input.focus();
}

socket.on("connect", () => {
  document.getElementById("status").textContent = "آنلاین";
});

socket.on("disconnect", () => {
  document.getElementById("status").textContent = "اتصال قطع شد؛ در حال تلاش مجدد...";
});

socket.on("message", addMessage);

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage();
  });
} else {
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") sendMessage();
  });
}

startChat();
loadMessages();
