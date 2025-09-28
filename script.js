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

