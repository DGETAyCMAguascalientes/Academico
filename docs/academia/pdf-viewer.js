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

    const isDocx = /\.docx$/i.test(url.pathname);
    // If it's a docx without preview, let the browser download it directly without blocking modal
    if (isDocx && !link.dataset.docxPreview) {
      link.setAttribute('download', decodeURIComponent(url.pathname.split('/').pop()));
      return;
    }

    if (!isDocx && !isPdfLink(link, url)) return;

    event.preventDefault();
    returnFocus = link;
    const label = link.querySelector('.mat-title')?.textContent?.trim() || link.textContent.trim() || 'Documento PDF';
    title.textContent = label;
    openLink.href = url.href;
    openLink.textContent = 'Abrir aparte';
    downloadLink.href = url.href;
    downloadLink.download = decodeURIComponent(url.pathname.split('/').pop());
    downloadLink.textContent = 'Descargar';
    frame.title = 'Vista previa del documento PDF';
    frame.src = url.href + '#toolbar=1&navpanes=0&view=FitH';
    dialog.querySelector('.pdf-viewer-help').textContent = 'Si la vista previa no aparece en tu navegador, usa «Abrir aparte» o «Descargar».';
    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  });

  function closeViewer() {
    if (!dialog.open) return;
    dialog.close();
    frame.removeAttribute('src');
    returnFocus?.focus();
  }

  closeButton.addEventListener('click', closeViewer);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeViewer();
  });
  dialog.addEventListener('close', () => frame.removeAttribute('src'));
})();
