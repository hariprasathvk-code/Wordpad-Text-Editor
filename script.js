function formatdoc(cmd, value = null) {
    if (value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
}

const fontFamilySelect = document.getElementById('fontFamily');

fontFamilySelect.addEventListener('change', function () {
    const font = this.value;
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
        const selectedText = sel.toString();
        document.execCommand("insertHTML", false, `<span style="font-family:${font};">${selectedText}</span>`);
    } else {
        content.style.fontFamily = font;
    }
    this.selectedIndex = 0;
});

function addlink() {
    const url = prompt('Insert URL');
    if (url) formatdoc('createLink', url);
}

//onclick functionality for text link
content.addEventListener('click', function(e) {
    const target = e.target;
    if (target.tagName === 'A') {
        e.preventDefault();
        window.open(target.href, '_blank');
    }
});

//filehandling saving and exporting
class FileHandler {
    constructor(contentElement, filenameInput, authorInput) {
        this.content = contentElement;
        this.filenameInput = filenameInput;
        this.authorInput = authorInput;
    }

    get filename() {
        return this.filenameInput.value || "untitled";
    }

    get author() {
        return this.authorInput.value || "authorname";
    }

    createDownload(blob, extension) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${this.filename}.${extension}`;
        link.click();
    }

    newFile() {
        this.content.innerHTML = "";
        this.filenameInput.value = "untitled";
        this.authorInput.value = "authorname";
    }

    saveAsTxt() {
        const text = `Title: ${this.filename}\nAuthor: ${this.author}\n\n${this.content.innerText}`;
        const blob = new Blob([text], { type: "text/plain" });
        this.createDownload(blob, "txt");
    }

    saveAsPdf() {
        const pdfContent = document.createElement("div");
        pdfContent.innerHTML = `<h1>${this.filename}</h1>
            <p><strong>Author:</strong> ${this.author}</p>${this.content.innerHTML}`;

        html2pdf().set({
            margin: 10,
            filename: this.filename + ".pdf",
            html2canvas: { scale: 2 }
        }).from(pdfContent).save();
    }

    saveAsDoc() {
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'></head><body>`;
        const footer = "</body></html>";
        const sourceHTML = header +
            `<h1>${this.filename}</h1><p><strong>Author:</strong> ${this.author}</p>` +
            this.content.innerHTML + footer;

        const blob = new Blob(["\ufeff", sourceHTML], { type: "application/msword" });
        this.createDownload(blob, "doc");
    }

    saveAsHtml() {
        const htmlHeader = `<html><head><meta charset="utf-8"><title>${this.filename}</title></head><body>`;
        const htmlTitle = `<h1>${this.filename}</h1>`;
        const htmlAuthor = `<p><strong>Author:</strong> ${this.author}</p>`;
        const htmlFooter = `</body></html>`;

        const finalHTML = htmlHeader + htmlTitle + htmlAuthor + this.content.innerHTML + htmlFooter;
        const blob = new Blob([finalHTML], { type: "text/html" });
        this.createDownload(blob, "html");
    }

    handleAction(action) {
        switch (action) {
            case "new": this.newFile(); break;
            case "txt": this.saveAsTxt(); break;
            case "pdf": this.saveAsPdf(); break;
            case "doc": this.saveAsDoc(); break;
            case "html": this.saveAsHtml(); break;
            default: console.warn("Unknown action:", action);
        }
    }
}

// Usage 
const fileHandler = new FileHandler(
    document.getElementById("content"),
    document.getElementById("filename"),
    document.getElementById("authorname")
);

function filehandle(value) {
    fileHandler.handleAction(value);
}


//image upload via url and local
class Editor {
    constructor(content) {
        this.content = content;
    }
    insertNodeAtCaret(node) {
        let sel = window.getSelection();
        if (sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(node);
            range.setStartAfter(node);
            range.setEndAfter(node);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            this.content.appendChild(node);
        }
    }
    insertImage(src) {
        let img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "inline-block";
        img.style.resize = "both";
        img.style.overflow = "auto";

        let wrapper = document.createElement('div');
        wrapper.style.display = "inline-block";
        wrapper.style.resize = "both";
        wrapper.style.overflow = "auto";
        wrapper.appendChild(img);

        this.insertNodeAtCaret(wrapper);
    }
}

const editor = new Editor(content);

const insertImageUrlBtn = document.getElementById('insertImageUrlBtn');
insertImageUrlBtn.addEventListener('click', function () {
    const url = prompt('Enter Image URL');
    if (url) editor.insertImage(url);
});

const imageInput = document.getElementById('imageInput');
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            editor.insertImage(e.target.result);
        }
        reader.readAsDataURL(file);
    }
});


// Insert Table 
const insertTableBtn = document.getElementById('insertTableBtn');
insertTableBtn.addEventListener('click', function() {
    const rows = prompt("Number of rows", 2);
    const cols = prompt("Number of columns", 2);

    if (rows > 0 && cols > 0) {
        let table = document.createElement('table');
        table.style.border = "1px solid black";
        table.style.borderCollapse = "collapse";
        table.style.width = "auto";
        table.contentEditable = false; 

        for (let r = 0; r < rows; r++) {
            let tr = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                let td = document.createElement('td');
                td.style.border = "1px solid black";
                td.style.padding = "6px";
                td.style.minWidth = "50px";
                td.style.height = "30px";
                td.contentEditable = true; 
                td.innerHTML = " ";
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        let wrapper = document.createElement('div');
        wrapper.style.display = "inline-block";
        wrapper.style.resize = "both";
        wrapper.style.overflow = "auto";
        wrapper.appendChild(table);
        insertNodeAtCaret(wrapper);
    }
});

function insertNodeAtCaret(node) {
    let sel = window.getSelection();
    if (sel.rangeCount > 0) {
        let range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);

        range.setStartAfter(node);
        range.setEndAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        content.appendChild(node);
    }
}

//preview
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closeBtn = previewModal.querySelector('.close');

previewBtn.addEventListener('click', () => {
    const currentTitle = filename.value || 'untitled';
    const currentAuthor = authorname.value || 'authorname';
    const contentHTML = document.getElementById('content').innerHTML;

    // Fill preview with Title, Author, and Content
    previewBody.innerHTML = `<h1>${currentTitle}</h1><p><strong>Author:</strong> ${currentAuthor}</p>${contentHTML}`;
    previewModal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.style.display = 'none';
    }
});


const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggleBtn.textContent = document.body.classList.contains('dark') ? "☀️" : "🌙";
});
// Autosave function
function autosave() {
    const data = {
        filename: filename.value || 'untitled',
        author: authorname.value || 'authorname',
        content: content.innerHTML
    };
    localStorage.setItem('autosaveData', JSON.stringify(data));
    console.log('Autosaved'); 
}

// Restore function on page load
function restoreAutosave() {
    const savedData = localStorage.getItem('autosaveData');
    if (savedData) {
        const data = JSON.parse(savedData);
        filename.value = data.filename;
        authorname.value = data.author;
        content.innerHTML = data.content;
    }
}

window.addEventListener('DOMContentLoaded', restoreAutosave);

// Autosave every 5 seconds
setInterval(autosave, 5000);


//find and replace, replace all
const ed = document.getElementById("content");
const findInput = document.getElementById("findText");
const replaceInput = document.getElementById("replaceText");
const findNextBtn = document.getElementById("findNext");
const replaceOneBtn = document.getElementById("replaceOne");
const replaceAllBtn = document.getElementById("replaceAll");

let lastMatchIndex = 0;

// Highlight next match
function findNext() {
  const searchTerm = findInput.value.trim();
  if (!searchTerm) return;

  const text = ed.innerText;
  const matchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase(), lastMatchIndex);

  if (matchIndex === -1) {
    //alert("No more matches found");
    lastMatchIndex = 0; // Reset
    return;
  }

  lastMatchIndex = matchIndex + searchTerm.length;

  // Highlight the match in editor
  let charIndex = 0;
  let nodeStack = [ed];
  let node, found = false;

  while (!found && (node = nodeStack.pop())) {
    if (node.nodeType === 3) { // Text node
      const nextCharIndex = charIndex + node.length;
      if (matchIndex >= charIndex && matchIndex < nextCharIndex) {
        const range = document.createRange();
        range.setStart(node, matchIndex - charIndex);
        range.setEnd(node, matchIndex - charIndex + searchTerm.length);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        ed.focus();
        found = true;
      }
      charIndex = nextCharIndex;
    } else {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }
}

// Replace current selection
function replaceOne() {
  const searchTerm = findInput.value.trim();
  const replacement = replaceInput.value;
  if (!searchTerm) return;

  const sel = window.getSelection();
  const selectedText = sel.toString();

  if (selectedText.toLowerCase() === searchTerm.toLowerCase()) {
    document.execCommand("insertText", false, replacement);
    lastMatchIndex = sel.anchorOffset + replacement.length; // update index
  }

  findNext();
}

// Replace all matches
function replaceAll() {
  const searchTerm = findInput.value.trim();
  const replacement = replaceInput.value;
  if (!searchTerm) return;

  const regex = new RegExp(searchTerm, "gi");

  function walkAndReplace(node) {
    if (node.nodeType === 3) {
      node.nodeValue = node.nodeValue.replace(regex, replacement);
    } else {
      node.childNodes.forEach(walkAndReplace);
    }
  }

  walkAndReplace(ed);
  lastMatchIndex = 0;
}

// Event listeners
findNextBtn.addEventListener("click", findNext);
replaceOneBtn.addEventListener("click", replaceOne);
replaceAllBtn.addEventListener("click", replaceAll);

// Ribbon Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // remove active from all
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // add active to clicked
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});