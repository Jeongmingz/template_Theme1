declare module "html2pdf.js" {
  type Html2PdfWorker = {
    set(options: unknown): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    save(): Promise<void>;
  };

  export default function html2pdf(): Html2PdfWorker;
}
