declare module 'html2pdf.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf: any;
  export = html2pdf;
}

// Also declare the global variable if it's used directly from a script tag
// or if the library attaches itself to the window object.
// Check how html2pdf is being used in the code to confirm if this is needed.
// For now, assuming it's imported as a module.
// declare var html2pdf: any;
