import { saveFile, readFile } from "../../firebase/firebase.js";

export function TextEditorApp(container, context) {
  const home = context.data.filesystem?.home || {};
  const files = [];

  for (const folder of Object.keys(home)) {
    const item = home[folder];
    if (!item || typeof item !== "object") continue;
    for (const [key, file] of Object.entries(item)) {
      if (file?.type === "text" || file?.type === "email" || file?.content !== undefined) {
        files.push({ folder, key, name: file.name || key });
      }
    }
  }

  container.innerHTML = `
    <div class="editor-app">
      <aside>
        <h3>Text Files</h3>
        <button id="newTextFile">+ New File</button>
        <div id="textFileList">
          ${files.map(f => `<button data-folder="${f.folder}" data-name="${f.name}">${f.folder}/${f.name}</button>`).join("") || "<p>No text files.</p>"}
        </div>
      </aside>

      <section>
        <div class="editor-toolbar">
          <select id="editorFolder">
            <option>Documents</option>
            <option>Downloads</option>
            <option>Desktop</option>
          </select>
          <input id="editorFilename" placeholder="notes.txt" value="notes.txt" />
          <button id="saveTextFile">Save</button>
        </div>
        <textarea id="editorContent" placeholder="Write something..."></textarea>
        <p id="editorStatus">Ready.</p>
      </section>
    </div>
  `;

  const folderInput = container.querySelector("#editorFolder");
  const filenameInput = container.querySelector("#editorFilename");
  const contentInput = container.querySelector("#editorContent");
  const status = container.querySelector("#editorStatus");

  container.querySelector("#newTextFile").onclick = () => {
    folderInput.value = "Documents";
    filenameInput.value = "notes.txt";
    contentInput.value = "";
    status.textContent = "New file.";
  };

  container.querySelectorAll("[data-folder]").forEach(button => {
    button.onclick = async () => {
      const folder = button.dataset.folder;
      const name = button.dataset.name;
      const file = await readFile(context.user.uid, folder, name);
      folderInput.value = folder;
      filenameInput.value = name;
      contentInput.value = file?.content || "";
      status.textContent = `Opened ${folder}/${name}`;
    };
  });

  container.querySelector("#saveTextFile").onclick = async () => {
    const folder = folderInput.value;
    const filename = filenameInput.value.trim() || "untitled.txt";
    const content = contentInput.value;
    await saveFile(context.user.uid, folder, filename, content, "text");

    context.data.filesystem = context.data.filesystem || { home: {} };
    context.data.filesystem.home = context.data.filesystem.home || {};
    context.data.filesystem.home[folder] = context.data.filesystem.home[folder] || {};

    status.textContent = `Saved ${folder}/${filename}`;
  };
}
