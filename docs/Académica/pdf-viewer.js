(() => {
  if (!('HTMLDialogElement' in window)) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'pdf-viewer-dialog';
  dialog.setAttribute('aria-labelledby', 'pdf-viewer-title');
  dialog.innerHTML = `
    <div class="pdf-viewer-shell">
      <header class="pdf-viewer-head">
        <h2 class="pdf-viewer-heading" id="pdf-viewer-title">Documento PDF</h2>
        <div class="pdf-viewer-actions">
          <a class="pdf-viewer-open" target="_blank" rel="noopener noreferrer">Abrir aparte</a>
          <a class="pdf-viewer-download" download>Descargar</a>
          <a class="pdf-viewer-download-preview" download hidden>Descargar PDF</a>
          <button class="pdf-viewer-close" type="button" aria-label="Cerrar visor">×</button>
        </div>
      </header>
      <iframe class="pdf-viewer-frame" title="Vista previa del documento PDF" loading="lazy"></iframe>
      <p class="pdf-viewer-help">Si la vista previa no aparece en tu navegador, usa «Abrir aparte» o «Descargar».</p>
    </div>`;
  document.body.append(dialog);

  const frame = dialog.querySelector('.pdf-viewer-frame');
  const title = dialog.querySelector('#pdf-viewer-title');
  const openLink = dialog.querySelector('.pdf-viewer-open');
  const downloadLink = dialog.querySelector('.pdf-viewer-download');
  const downloadPreviewLink = dialog.querySelector('.pdf-viewer-download-preview');
  const closeButton = dialog.querySelector('.pdf-viewer-close');
  let returnFocus = null;

  function isPdfLink(link, url) {
    return link.dataset.pdfViewer === 'true' || /\.pdf$/i.test(url.pathname);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const previewPath = link.dataset.docxPreview;
    const isDocx = Boolean(previewPath) || /\.docx$/i.test(url.pathname);
    if (!isDocx && !isPdfLink(link, url)) return;
    let previewUrl = url;
    if (isDocx) {
      try {
        const inferredPreview = url.pathname.replace(/\/documentos-docx\/([^/]+)\.docx$/i, '/documentos-docx/vistas-pdf/$1.pdf');
        if (!previewPath && inferredPreview === url.pathname) return;
        previewUrl = new URL(previewPath || inferredPreview, previewPath ? location.href : location.origin);
      } catch { return; }
    }

    event.preventDefault();
    returnFocus = link;
    const label = link.querySelector('.mat-title')?.textContent?.trim() || link.textContent.trim() || (isDocx ? 'Documento Word' : 'Documento PDF');
    title.textContent = isDocx ? `Vista previa · ${label}` : label;
    openLink.href = previewUrl.href;
    openLink.textContent = isDocx ? 'Abrir vista previa' : 'Abrir aparte';
    downloadLink.href = url.href;
    downloadLink.download = isDocx ? decodeURIComponent(url.pathname.split('/').pop()) : '';
    downloadLink.textContent = isDocx ? 'Descargar DOCX' : 'Descargar';
    downloadPreviewLink.hidden = !isDocx;
    if (isDocx) {
      downloadPreviewLink.href = previewUrl.href;
      downloadPreviewLink.download = decodeURIComponent(previewUrl.pathname.split('/').pop());
    }
    frame.title = isDocx ? 'Vista previa PDF del documento Word' : 'Vista previa del documento PDF';
    frame.src = previewUrl.href + '#toolbar=1&navpanes=0&view=FitH';
    dialog.querySelector('.pdf-viewer-help').textContent = isDocx
      ? 'Vista de lectura convertida desde el archivo Word. Puedes descargar el DOCX original o su versión PDF.'
      : 'Si la vista previa no aparece en tu navegador, usa «Abrir aparte» o «Descargar».';
    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  });

  function closeViewer() {
    if (!dialog.open) return;
    dialog.close();
    frame.removeAttribute('src');
    downloadPreviewLink.hidden = true;
    returnFocus?.focus();
  }

  closeButton.addEventListener('click', closeViewer);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener('close', () => frame.removeAttribute('src'));
})();
