document.getElementById('saveBtn').addEventListener('click', () => {
  const text = document.getElementById('editor').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'texte.txt';
  link.click();
});
