const URL = 'pdf/Natural-Landscape-and-Photography.pdf';
const WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs';

var pdfDoc, pageNum, pageRendering, pageNumPending = null, scale, canvas = document.getElementById('the-canvas'), ctx = canvas.getContext('2d');

function renderPage(num) {
	pageRendering = true;

	pdfDoc.getPage(num).then(function(page) {
	  var viewport = page.getViewport({ scale: scale, });
	  var outputScale = window.devicePixelRatio || 1;

	  canvas.width = Math.floor(viewport.width * outputScale);
	  canvas.height = Math.floor(viewport.height * outputScale);
	  canvas.style.width = Math.floor(viewport.width) + "px";
	  canvas.style.height =  Math.floor(viewport.height) + "px";

	  var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

	  var renderContext = {
		canvasContext: ctx,
		transform: transform,
		viewport: viewport,
	  };
	  var renderTask = page.render(renderContext);

	  renderTask.promise.then(function () {
		pageRendering = false;
		if (pageNumPending !== null) {
		  renderPage(pageNumPending);
		  pageNumPending = null;
		}
	  });
	});

	document.getElementById('page_num').textContent = num;
}

function queueRenderPage(num) {
	if (pageRendering) {
	  pageNumPending = num;
	} else {
	  renderPage(num);
	}
}

function onPrevPage() {
	if (pageNum <= 1) {
	  return;
	}
	pageNum--;
	queueRenderPage(pageNum);
}

function onNextPage() {
	if (pageNum >= pdfDoc.numPages) {
	  return;
	}
	pageNum++;
	queueRenderPage(pageNum);
}

async function addEventListeneres()
{
	document.getElementById('prev').addEventListener('click', onPrevPage);
	document.getElementById('next').addEventListener('click', onNextPage);
}

async function init(pdfUrl, worker)
{
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
  pdfDoc = null;
  pageNum = 1;
  pageRendering = false;
  pageNumPending = null;
  scale = 0.8;
  canvas = document.getElementById('the-canvas');
  ctx = canvas.getContext('2d');

  pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
  document.getElementById('page_count').textContent = pdfDoc.numPages;
  await addEventListeneres();
  renderPage(pageNum);
}

await init(URL, WORKER);