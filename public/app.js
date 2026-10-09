
const socket = io();

const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

let username = "";

function startChat() {
  username = prompt("اسمت رو وارد کن:");
  if (!username || !username.trim()) {
    username = "کاربر";
  }
  username = username.trim().slice(0, 30);
  socket.emit("join", username);
}

function addMessage(message) {
  const div = document.createElement("div");
  div.className = "message";

  const name = document.createElement("strong");
  name.textContent = message.username + ": ";

  const text = document.createElement("span");
  text.textContent = message.text;

  div.appendChild(name);
  div.appendChild(text);
  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
}

async function loadMessages() {
  try {
    const response = await fetch("/api/messages");
    if (!response.ok) throw new Error("خطا در دریافت پیام‌ها");

    const oldMessages = await response.json();
    messages.replaceChildren();

    oldMessages.forEach(message => addMessage(message));
  } catch (error) {
    console.error(error);
  }
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  socket.emit("sendMessage", text);
  input.value = "";
  input.focus();
}

socket.on("message", message => {
  addMessage(message);
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

startChat();
loadMessages();
