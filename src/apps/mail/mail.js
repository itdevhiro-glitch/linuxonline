import { sendMail, watchMailbox, watchPublicUsers } from "../../firebase/firebase.js";

export function MailApp(container, context) {
  let users = {};
  container.innerHTML = `
    <div class="mail-app">
      <aside>
        <button data-box="inbox">Inbox</button>
        <button data-box="sent">Sent</button>
        <h3>Compose</h3>
        <form id="mailForm">
          <select id="mailTo"></select>
          <input id="mailSubject" placeholder="Subject" />
          <textarea id="mailBody" placeholder="Write mail..."></textarea>
          <button>Send Mail</button>
        </form>
      </aside>
      <section>
        <header><h2 id="mailTitle">Inbox</h2></header>
        <div id="mailList"></div>
      </section>
    </div>
  `;

  const select = container.querySelector("#mailTo");
  const list = container.querySelector("#mailList");
  const title = container.querySelector("#mailTitle");

  watchPublicUsers((u) => {
    users = u;
    select.innerHTML = Object.values(users)
      .filter(user => user.uid !== context.user.uid)
      .map(user => `<option value="${user.uid}">${escapeHtml(user.email)}</option>`)
      .join("");
  });

  function loadBox(box) {
    title.textContent = box === "sent" ? "Sent Mail" : "Inbox";
    watchMailbox(context.user.uid, box, (mails) => {
      const arr = Object.values(mails).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      list.innerHTML = arr.map(mail => `
        <article class="mail-card">
          <h3>${escapeHtml(mail.subject || "(no subject)")}</h3>
          <p><b>From:</b> ${escapeHtml(mail.fromEmail || "")}</p>
          <p><b>To:</b> ${escapeHtml(mail.toEmail || "")}</p>
          <div>${escapeHtml(mail.body || "")}</div>
        </article>
      `).join("") || "<p>No mail.</p>";
    });
  }

  container.querySelectorAll("[data-box]").forEach(btn => {
    btn.onclick = () => loadBox(btn.dataset.box);
  });

  container.querySelector("#mailForm").onsubmit = async (e) => {
    e.preventDefault();
    const toUid = select.value;
    if (!toUid || !users[toUid]) return;
    await sendMail(context.user.uid, toUid, {
      fromEmail: context.user.email,
      toEmail: users[toUid].email,
      subject: container.querySelector("#mailSubject").value.trim() || "(no subject)",
      body: container.querySelector("#mailBody").value.trim()
    });
    container.querySelector("#mailSubject").value = "";
    container.querySelector("#mailBody").value = "";
    loadBox("sent");
  };

  loadBox("inbox");
}

function escapeHtml(v) {
  return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
