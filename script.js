document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const clippings = parseClippings(content);
            displayBookList(clippings);
        };
        reader.readAsText(file);
    }
});

function parseClippings(content) {
    const clippings = [];
    const entries = content.split('==========');
    entries.forEach(entry => {
        const lines = entry.trim().split('\n');
        if (lines.length > 2) {
            const [titleAuthor, meta, ...text] = lines;
            const lastParenIndex = titleAuthor.lastIndexOf('(');
            const title = titleAuthor.substring(0, lastParenIndex).trim();
            const author = titleAuthor.substring(lastParenIndex + 1, titleAuthor.length - 2).trim();
            const metaParts = meta.split(' | ');
            if (metaParts.length === 3) {
                const [type, location, datetime] = metaParts;
                clippings.push({
                    title: title,
                    author: author,
                    type: type.replace('- Your ', '').trim(),
                    location: location.replace('Location ', '').trim(),
                    datetime: datetime.replace('Added on ', '').trim(),
                    text: text.join('\n').trim()
                });
            } else {
                console.error('Invalid meta format:', meta);
            }
        }
    });
    return clippings;
}

function displayBookList(clippings) {
    const bookListDiv = document.getElementById('bookList');
    const books = {};

    clippings.forEach(clipping => {
        if (!books[clipping.title]) {
            books[clipping.title] = [];
        }
        books[clipping.title].push(clipping);
    });

    for (const [title, clippings] of Object.entries(books)) {
        const bookTitleDiv = document.createElement('div');
        bookTitleDiv.className = 'book-title';
        bookTitleDiv.textContent = title;
        bookListDiv.appendChild(bookTitleDiv);

        clippings.sort((a, b) => parseInt(a.location.split('-')[0]) - parseInt(b.location.split('-')[0]));

        clippings.forEach(clipping => {
            const clippingDiv = document.createElement('div');
            clippingDiv.className = 'clipping';
            clippingDiv.textContent = `${clipping.type} at ${clipping.location}`;
            clippingDiv.addEventListener('click', () => displayClippingDetails(clipping));
            bookListDiv.appendChild(clippingDiv);
        });
    }
}

function displayClippingDetails(clipping) {
    const clippingDetailsDiv = document.getElementById('clippingDetails');
    clippingDetailsDiv.innerHTML = `
        <div class="clipping-title">Title: ${clipping.title}</div>
        <div class="clipping-author">Author: ${clipping.author}</div>
        <div class="clipping-type">Type: ${clipping.type}</div>
        <div class="clipping-location">Location: ${clipping.location}</div>
        <div class="clipping-datetime">DateTime: ${clipping.datetime}</div>
        ${clipping.text ? `<br /><div class="clipping-text">${clipping.text}<button class="copy-button" onclick="copyToClipboard('${clipping.text}')">Copy</button></div>` : ''}
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard!');
    });
}
