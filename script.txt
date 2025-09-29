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

//filehandling saving and exporting
const filename = document.getElementById('filename');
const authorname = document.getElementById('authorname'); 

function filehandle(value) {
    const currentFilename = filename.value || 'untitled';
    const currentAuthor = authorname.value || 'authorname';

    if (value === 'new') {
        content.innerHTML = '';
        filename.value = 'untitled';
        authorname.value = 'authorname';
    } 
    // save as txt
    else if (value === 'txt') {
        const blob = new Blob([`Title: ${currentFilename}\nAuthor: ${currentAuthor}\n\n${content.innerText}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentFilename}.txt`;
        link.click();
    } 
    //save as pdf
    else if (value === 'pdf') {
        const pdfContent = document.createElement('div');
        pdfContent.innerHTML = `<h1>${currentFilename}</h1><p><strong>Author:</strong> ${currentAuthor}</p>${content.innerHTML}`;

        html2pdf().set({ margin: 10, filename: currentFilename + ".pdf", html2canvas: { scale: 2 } })
            .from(pdfContent)
            .save();
    } 
    //save as doc(word file)
    else if (value === 'doc') {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                       "xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + `<h1>${currentFilename}</h1><p><strong>Author:</strong> ${currentAuthor}</p>` + content.innerHTML + footer;

        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentFilename}.doc`;
        link.click();
    } 
    //save as html
    else if (value === 'html') {
        const htmlHeader = `<html><head><meta charset="utf-8"><title>${currentFilename}</title></head><body>`;
        const htmlTitle = `<h1>${currentFilename}</h1>`;
        const htmlAuthor = `<p><strong>Author:</strong> ${currentAuthor}</p>`;
        const htmlContent = content.innerHTML;
        const htmlFooter = `</body></html>`;

        const finalHTML = htmlHeader + htmlTitle + htmlAuthor + htmlContent + htmlFooter;

        const blob = new Blob([finalHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentFilename}.html`;
        link.click();
    }
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
