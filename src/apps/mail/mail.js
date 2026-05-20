import { sendMail, watchMailbox, watchPublicUsers, saveFile, sanitizeFirebaseKey } from "../../firebase/firebase.js";

let latestMails = [];

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
      .join("") || `<option value="">No other user</option>`;
  });

  function loadBox(box) {
    title.textContent = box === "sent" ? "Sent Mail" : "Inbox";
    watchMailbox(context.user.uid, box, (mails) => {
      latestMails = Object.values(mails).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      list.innerHTML = latestMails.map((mail, index) => `
        <article class="mail-card">
          <h3>${escapeHtml(mail.subject || "(no subject)")}</h3>
          <p><b>From:</b> ${escapeHtml(mail.fromEmail || "")}</p>
          <p><b>To:</b> ${escapeHtml(mail.toEmail || "")}</p>
          <div>${escapeHtml(mail.body || "")}</div>
          <button data-save-mail="${index}">Save to Downloads</button>
        </article>
      `).join("") || "<p>No mail.</p>";

      list.querySelectorAll("[data-save-mail]").forEach(button => {
        button.onclick = async () => {
          const mail = latestMails[Number(button.dataset.saveMail)];
          const filename = `mail_${Date.now()}_${sanitizeFirebaseKey(mail.subject || "no_subject")}.txt`;
          const content = `Subject: ${mail.subject || "(no subject)"}\nFrom: ${mail.fromEmail}\nTo: ${mail.toEmail}\n\n${mail.body || ""}`;
          await saveFile(context.user.uid, "Downloads", filename, content, "email");
          context.data.filesystem = context.data.filesystem || { home: {} };
          context.data.filesystem.home = context.data.filesystem.home || {};
          context.data.filesystem.home.Downloads = context.data.filesystem.home.Downloads || {};
          context.data.filesystem.home.Downloads[sanitizeFirebaseKey(filename)] = {
            name: filename,
            type: "email",
            content,
            updatedAt: new Date().toISOString()
          };
          button.textContent = "Saved!";
        };
      });
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
