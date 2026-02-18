import ReactDOMServer from "react-dom/server";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuotePdf from "../components/QuotePDF.jsx";

export async function exportQuotePdf(quote, totals) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  container.innerHTML = ReactDOMServer.renderToString(
    <QuotePdf quote={quote}/>
  );

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${quote.name || "quote"}.pdf`);

  document.body.removeChild(container);
}
