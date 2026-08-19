// ===== USER PROFILE PAGE =====

requireLogin();

document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('userInfo');
  const userFiles = document.getElementById('userFiles');
  const statsFiles = document.getElementById('statsFiles');
  const statsDownloads = document.getElementById('statsDownloads');

  auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    userInfo.innerHTML = `
      <div class="profile-avatar">${(user.displayName || user.email[0]).toUpperCase()}</div>
      <h2>${escapeHtml(user.displayName || 'User')}</h2>
      <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(user.email)}</p>
      <p><i class="fa-solid fa-calendar"></i> Joined: ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
    `;

    try {
      const snapshot = await db.collection('files')
        .where('uploaderId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      let totalDownloads = 0;

      if (snapshot.empty) {
        userFiles.innerHTML = `
          <div class="no-results">
            <i class="fa-solid fa-folder-open"></i>
            <p>You have not uploaded any files yet.</p>
            <a href="upload.html" class="download-btn" style="margin-top:15px;display:inline-block;">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload Your First File
            </a>
          </div>
        `;
        statsFiles.textContent = '0';
        statsDownloads.textContent = '0';
        return;
      }

      const files = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        files.push({ id: doc.id, ...data });
        totalDownloads += data.downloads || 0;
      });

      statsFiles.textContent = files.length;
      statsDownloads.textContent = totalDownloads;

      userFiles.innerHTML = files.map(f => createFileCard(f, f.id)).join('');

    } catch (error) {
      userFiles.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Error loading your files.</p>
        </div>
      `;
    }
  });
});

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
