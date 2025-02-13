import { pdfBase64 } from "./pdfData.js"; //A PDF, converted to a base64 encoded string

const URL = 'pdf/Queen - Best Albums.pdf'; //An URL of a PDF.

const WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.mjs';

var pdfDoc, pageNum, pageRendering, pageNumPending = null, scale, canvasElm, ctx;

function renderPage(num) {
	pageRendering = true;

	pdfDoc.getPage(num).then(function(page) {
	  var viewport = page.getViewport({ scale: scale, });
	  var outputScale = window.devicePixelRatio || 1;

	  canvasElm.width = Math.floor(viewport.width * outputScale);
	  canvasElm.height = Math.floor(viewport.height * outputScale);
	  canvasElm.style.width = Math.floor(viewport.width) + "px";
	  canvasElm.style.height =  Math.floor(viewport.height) + "px";

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

async function getPdfFromUrl(pdfUrl) {
	return pdfjsLib.getDocument(pdfUrl).promise;
}

async function getPdfFromBase64(pdfBase64) {
	let pdfData = atob(pdfBase64);
	return pdfjsLib.getDocument({ data: pdfData }).promise;
}

async function init(pdfUrl, worker) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
  pdfDoc = null;
  pageNum = 1;
  pageRendering = false;
  pageNumPending = null;
  scale = 0.8;
  canvasElm = document.getElementById('the-canvas');
  ctx = canvasElm.getContext('2d');

  pdfDoc = await getPdfFromUrl(pdfUrl); //Use this if the PDF is a URL.
  //pdfDoc = await getPdfFromBase64(pdfBase64);
  document.getElementById('page_count').textContent = pdfDoc.numPages;
  await addEventListeneres();
  renderPage(pageNum);
}

await init(URL, WORKER);
