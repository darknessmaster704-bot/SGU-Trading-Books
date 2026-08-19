// ===== MAIN APP LOGIC =====
// Handles: Search, Display Files, Dark Mode

const typeConfig = {
  book: { label: "Book", color: "#4eb7da", icon: "fa-book" },
  notes: { label: "Notes", color: "#4ade80", icon: "fa-file-lines" },
  recording: { label: "Recording", color: "#f472b6", icon: "fa-headphones" },
  slides: { label: "Slides", color: "#fbbf24", icon: "fa-file-powerpoint" },
  other: { label: "Other", color: "#a78bfa", icon: "fa-file" }
};

function createFileCard(file, fileId) {
  const config = typeConfig[file.type] || typeConfig.other;
  const uploaderName = file.uploaderName || (file.uploaderEmail ? file.uploaderEmail.split('@')[0] : 'Anonymous');

  return `
    <div class="file-card" data-title="${file.title.toLowerCase()}" data-subject="${file.subject.toLowerCase()}">
      <div class="file-icon" style="background: ${config.color}20; color: ${config.color};">
        <i class="fa-solid ${file.icon || config.icon}"></i>
      </div>
      <div class="file-info">
        <span class="file-type" style="background: ${config.color}20; color: ${config.color};">${config.label}</span>
        <h3>${escapeHtml(file.title)}</h3>
        <p class="file-meta"><i class="fa-solid fa-user"></i> ${escapeHtml(file.author || uploaderName)}</p>
        <p class="file-meta"><i class="fa-solid fa-book-open"></i> ${escapeHtml(file.subject)}</p>
        <p class="file-meta"><i class="fa-solid fa-calendar"></i> ${formatDate(file.createdAt)}</p>
        ${file.fileName ? `<p class="file-meta"><i class="fa-solid fa-file"></i> ${escapeHtml(file.fileName)}</p>` : ''}
      </div>
      <div class="file-actions">
        <span class="downloads"><i class="fa-solid fa-download"></i> ${file.downloads || 0}</span>
        <a href="${file.fileUrl || file.link || '#'}" class="download-btn" target="_blank" onclick="incrementDownload('${fileId}')">
          <i class="fa-solid fa-arrow-down"></i> Download
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return new Date(timestamp).toLocaleDateString();
}

async function incrementDownload(fileId) {
  try {
    const fileRef = db.collection('files').doc(fileId);
    await fileRef.update({ downloads: firebase.firestore.FieldValue.increment(1) });
  } catch (e) {
    console.log('Download count update failed (non-critical)');
  }
}

function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  const isDark = localStorage.getItem('darkMode') === 'true';

  if (isDark) {
    document.body.classList.add('dark-mode');
  }

  if (toggle) {
    toggle.checked = isDark;
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', toggle.checked);
    });
  }
}

async function loadFiles(containerId, searchInputId, termFilter = null) {
  const container = document.getElementById(containerId);
  const searchInput = document.getElementById(searchInputId);
  const noResults = document.getElementById('noResults');

  if (!container) return;

  container.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading files...</div>';

  try {
    let query = db.collection('files').orderBy('createdAt', 'desc');

    if (termFilter) {
      query = query.where('term', '==', parseInt(termFilter));
    }

    const snapshot = await query.get();

    let files = [];
    snapshot.forEach(doc => {
      files.push({ id: doc.id, ...doc.data() });
    });

    function display(filesToShow) {
      if (filesToShow.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
      }
      if (noResults) noResults.style.display = 'none';
      container.innerHTML = filesToShow.map(f => createFileCard(f, f.id)).join('');
    }

    display(files);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = files.filter(f => 
          f.title.toLowerCase().includes(term) || 
          f.subject.toLowerCase().includes(term) ||
          (f.author && f.author.toLowerCase().includes(term))
        );
        display(filtered);
      });
    }

  } catch (error) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Error loading files. Please check your Firebase configuration.</p>
        <p style="font-size:12px;opacity:0.7;margin-top:10px;">${error.message}</p>
      </div>
    `;
  }
}
