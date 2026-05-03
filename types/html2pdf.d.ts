declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: any;
    jsPDF?: any;
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    toPdf(): Html2Pdf;
    get(type: string): any;
    save(): Promise<void>;
    output(type: string): Promise<any>;
    then(callback: (pdf: any) => void): Html2Pdf;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
