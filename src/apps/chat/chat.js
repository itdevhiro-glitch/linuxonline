import { sendChatMessage, watchChatRoom, watchPublicUsers } from "../../firebase/firebase.js";

export function ChatApp(container, context) {
  container.innerHTML = `
    <div class="chat-app">
      <aside>
        <h3>Online Users</h3>
        <div id="chatUsers"></div>
      </aside>
      <section>
        <header>
          <h2>Global Chat</h2>
          <span>Realtime Firebase room</span>
        </header>
        <div id="chatMessages" class="chat-messages"></div>
        <form id="chatForm">
          <input id="chatInput" placeholder="Ketik pesan..." maxlength="300" autocomplete="off" />
          <button>Send</button>
        </form>
      </section>
    </div>
  `;

  const messages = container.querySelector("#chatMessages");
  const users = container.querySelector("#chatUsers");

  watchPublicUsers((list) => {
    users.innerHTML = Object.values(list).map(user => `
      <div class="user-pill">
        <span></span>
        <b>${escapeHtml(user.displayName || user.email)}</b>
      </div>
    `).join("");
  });

  watchChatRoom("global", (items) => {
    const arr = Object.values(items);
    messages.innerHTML = arr.map(msg => `
      <div class="chat-bubble ${msg.uid === context.user.uid ? "me" : ""}">
        <b>${escapeHtml(msg.email || "user")}</b>
        <p>${escapeHtml(msg.message || "")}</p>
      </div>
    `).join("");
    messages.scrollTop = messages.scrollHeight;
  });

  container.querySelector("#chatForm").onsubmit = async (e) => {
    e.preventDefault();
    const input = container.querySelector("#chatInput");
    const message = input.value.trim();
    if (!message) return;
    input.value = "";
    await sendChatMessage("global", {
      uid: context.user.uid,
      email: context.user.email,
      message
    });
  };
}

function escapeHtml(v) {
  return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
