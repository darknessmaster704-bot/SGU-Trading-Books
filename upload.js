// ===== REAL FILE UPLOAD LOGIC =====

requireLogin();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const fileDropZone = document.getElementById('fileDropZone');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');

  let selectedFile = null;

  fileDropZone.addEventListener('click', () => fileInput.click());
  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });
  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover');
  });
  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });

  function handleFileSelect(file) {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large! Maximum size is 50MB.');
      return;
    }
    selectedFile = file;
    fileNameDisplay.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#4ade80;"></i> Selected: <strong>${escapeHtml(file.name)}</strong> (${formatFileSize(file.size)})`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in first!');
      return;
    }

    const title = document.getElementById('fileTitle').value.trim();
    const term = parseInt(document.getElementById('fileTerm').value);
    const type = document.getElementById('fileType').value;
    const subject = document.getElementById('fileSubject').value.trim();
    const author = document.getElementById('fileAuthor').value.trim();

    if (!title || !term || !type || !subject) {
      alert('Please fill in all required fields!');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload!');
      return;
    }

    try {
      progressContainer.style.display = 'block';

      const safeFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = storage.ref(`files/${user.uid}/${safeFileName}`);

      const uploadTask = storageRef.put(selectedFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = progress + '%';
        },
        (error) => {
          alert('Upload failed: ' + error.message);
          progressContainer.style.display = 'none';
        },
        async () => {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

          const fileData = {
            title: title,
            term: term,
            type: type,
            subject: subject,
            author: author || user.displayName || user.email.split('@')[0],
            fileName: selectedFile.name,
            fileUrl: downloadURL,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            uploaderId: user.uid,
            uploaderName: user.displayName || user.email.split('@')[0],
            uploaderEmail: user.email,
            downloads: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          };

          await db.collection('files').add(fileData);

          await db.collection('users').doc(user.uid).update({
            filesCount: firebase.firestore.FieldValue.increment(1)
          });

          alert('File uploaded successfully!');
          window.location.href = 'index.html';
        }
      );

    } catch (error) {
      alert('Error: ' + error.message);
      progressContainer.style.display = 'none';
    }
  });
});

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
