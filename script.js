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
        bookTitleDiv.addEventListener('click', () => copyBookClippingsToClipboard(clippings));
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
        <div class="clipping-title">${clipping.title}</div>
        <div class="clipping-author">${clipping.author}</div>
        <hr class="hr-details">
        Type: <span class="clipping-type" id="clippingType">${clipping.type}</span><br />
        Location: <span class="clipping-location">${clipping.location}</span><br />
        Date Added: <span class="clipping-datetime">${clipping.datetime}</span><br />
        ${clipping.text ? `<div id="clippingText" class="clipping-text">${clipping.text}<br /></div>` : ''}<br />
        <div id="status-message"><span id="message-display"></span></div>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        flashAreaForMilliseconds('clippingDetails',200);
        flashMessageForMilliseconds("Copied text to clipboard!", 2000);
    });
}

function copyAreaToClipboard(areaName) {
    var clippingType = document.getElementById("clippingType");
    /* Get the text field */
    var clippingDiv = document.getElementById(areaName);
  
    /* Copy the text inside the text field */
    copyToClipboard(`${clippingType.innerText}: ${clippingDiv.innerText}`);
  } 

  function flashAreaForMilliseconds(areaName, ms) {
    var areaToFlash = document.getElementById(areaName);
    var originalColor = areaToFlash.style.backgroundColor;
    areaToFlash.style.backgroundColor = '#ffff3f';

    setTimeout(function() {
        areaToFlash.style.backgroundColor = originalColor;
    }, ms);
}

function flashMessageForMilliseconds(text, ms) {
    document.getElementById("message-display").innerHTML = text;
    var statusMessage = document.getElementById("status-message");
    statusMessage.style.visibility = "visible";

    setTimeout(function() {
        statusMessage.style.visibility = "hidden";
    }, ms);
}

function copyBookClippingsToClipboard(clippings) {
    const clippingTexts = clippings.map(clipping => {
        return `${clipping.type}: ${clipping.text}`;
    }).join('\n');
    copyToClipboard(clippingTexts);
}