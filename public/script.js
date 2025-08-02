let currentPage = 1;

window.onload = () => {
  // Attach file upload form listener
  document.getElementById('fileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch('/upload-file', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      this.reset();
      showPoems(); // Refresh list after upload
    })
    .catch(err => {
      console.error('Upload file error:', err);
      alert('Failed to upload file.');
    });
  });

  // Attach Submit Text button listener
  document.getElementById('submitTextBtn').addEventListener('click', uploadTextPoem);
};

function showUpload() {
  document.getElementById('upload-section').style.display = 'block';
  document.getElementById('view-section').style.display = 'none';
  currentPage = 1;
  console.log("Switched to Upload view");
}

function showPoems() {
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('view-section').style.display = 'block';
  currentPage = 1;
  console.log("Switched to View Poems");
  loadPoems(currentPage);
}

function uploadTextPoem() {
  console.log("Upload button clicked!");
  const text = document.getElementById('poemText').value.trim();
  if (!text) {
    alert("Poem text cannot be empty!");
    return;
  }

  fetch('/upload-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ poemText: text })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    document.getElementById('poemText').value = '';
    showPoems(); // Refresh list after upload
  })
  .catch(err => {
    console.error('Upload text error:', err);
    alert('Failed to upload poem.');
  });
}

function loadPoems(page) {
  console.log(`Loading poems for page ${page}...`);
  fetch(`/poems?page=${page}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('poemList');
      const pageInfo = document.getElementById('pageInfo');
      list.innerHTML = '';
      pageInfo.innerText = `Page ${page}`;

      if (data.poems.length === 0) {
        list.innerHTML = "<p>No poems on this page.</p>";
        return;
      }

      data.poems.forEach(filename => {
        fetch(`/poem/${filename}`)
          .then(res => res.text())
          .then(text => {
            const div = document.createElement('div');
            div.innerHTML = `<pre>${text}</pre><hr>`;
            list.appendChild(div);
          });
      });
    })
    .catch(err => {
      console.error('Load poems error:', err);
      alert('Failed to load poems.');
    });
}

function nextPage() {
  currentPage++;
  loadPoems(currentPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadPoems(currentPage);
  }
}
