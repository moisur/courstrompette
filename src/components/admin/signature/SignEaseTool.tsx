"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureCanvas from "react-signature-canvas";
import { 
  FileUp, 
  Download, 
  PenTool, 
  Trash2, 
  Check, 
  X, 
  Move,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react";

// Set up pdfjs worker locally via same-origin Next.js webpack bundling to comply with CSP policies
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export interface SignEaseToolProps {
  initialPdfFile?: File | null;
}

export function SignEaseTool({ initialPdfFile = null }: SignEaseToolProps) {
  // Signature management states
  const [savedSignatureUrl, setSavedSignatureUrl] = useState<string | null>(null);
  const [savedSignatureExists, setSavedSignatureExists] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingSignature, setIsLoadingSignature] = useState(true);
  
  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(initialPdfFile);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfFile ? URL.createObjectURL(initialPdfFile) : null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [renderScale, setRenderScale] = useState<number>(1.0);
  
  // Drag and Drop Signature Overlay states
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 }); // relative in % inside the container
  const [sigSize, setSigSize] = useState({ width: 150, height: 75 }); // pixels
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [overlayPlaced, setOverlayPlaced] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  // Load existing signature from server
  useEffect(() => {
    fetchSignature();
  }, []);

  // Sync initial PDF file changes and manage Object URLs cleanly to prevent memory leaks
  useEffect(() => {
    if (initialPdfFile) {
      const url = URL.createObjectURL(initialPdfFile);
      setPdfFile(initialPdfFile);
      setPdfUrl(url);
      setCurrentPage(1);
      setOverlayPlaced(false);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [initialPdfFile]);

  const fetchSignature = async () => {
    setIsLoadingSignature(true);
    try {
      const res = await fetch("/api/admin/signature");
      const data = await res.json();
      if (data.exists && data.url) {
        setSavedSignatureUrl(data.url);
        setSavedSignatureExists(true);
      } else {
        setSavedSignatureExists(false);
      }
    } catch (err) {
      console.error("Error loading signature:", err);
    } finally {
      setIsLoadingSignature(false);
    }
  };

  // Save hand-drawn signature to VPS
  const handleSaveSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return;
    
    setIsLoadingSignature(true);
    const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
    
    try {
      const res = await fetch("/api/admin/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        setSavedSignatureUrl(data.url);
        setSavedSignatureExists(true);
        setIsDrawing(false);
      } else {
        alert(data.error || "Impossible de sauvegarder la signature.");
      }
    } catch (err) {
      console.error("Error saving signature:", err);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsLoadingSignature(false);
    }
  };

  // Clear hand-drawn canvas
  const handleClearCanvas = () => {
    sigCanvasRef.current?.clear();
  };

  // PDF File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setCurrentPage(1);
      setOverlayPlaced(false);
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageRenderSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1.0 });
    setPdfDimensions({ width, height });
    
    if (pdfWrapperRef.current) {
      const wrapperWidth = pdfWrapperRef.current.clientWidth;
      setRenderScale(wrapperWidth / width);
    }
  };

  // Drag and Drop Handling inside rendered page
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!overlayPlaced) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (containerRef.current?.offsetLeft || 0),
      y: e.clientY - (containerRef.current?.offsetTop || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !pdfWrapperRef.current) return;
    
    const wrapper = pdfWrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    
    // Calculate new absolute positions inside the page wrapper
    let newX = e.clientX - rect.left - (sigSize.width / 2);
    let newY = e.clientY - rect.top - (sigSize.height / 2);
    
    // Bounds check
    newX = Math.max(0, Math.min(newX, rect.width - sigSize.width));
    newY = Math.max(0, Math.min(newY, rect.height - sigSize.height));
    
    // Convert to percentage values
    const pctX = (newX / rect.width) * 100;
    const pctY = (newY / rect.height) * 100;
    
    setSigPosition({ x: pctX, y: pctY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for tablets/phones
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!overlayPlaced || e.touches.length === 0) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !pdfWrapperRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const wrapper = pdfWrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    
    let newX = touch.clientX - rect.left - (sigSize.width / 2);
    let newY = touch.clientY - rect.top - (sigSize.height / 2);
    
    newX = Math.max(0, Math.min(newX, rect.width - sigSize.width));
    newY = Math.max(0, Math.min(newY, rect.height - sigSize.height));
    
    const pctX = (newX / rect.width) * 100;
    const pctY = (newY / rect.height) * 100;
    
    setSigPosition({ x: pctX, y: pctY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Resize signature helper
  const handleResize = (amount: number) => {
    setSigSize(prev => {
      const newWidth = Math.max(80, Math.min(300, prev.width + amount));
      const newHeight = Math.max(40, Math.min(150, prev.height + (amount / 2)));
      return { width: newWidth, height: newHeight };
    });
  };

  // Real core implementation of PDF embedding using pdf-lib
  const handleSignPDF = async () => {
    if (!pdfFile || !savedSignatureUrl || !pdfDimensions) return;
    setIsSigning(true);
    
    try {
      // 1. Fetch signature image binary
      const sigRes = await fetch(savedSignatureUrl);
      const sigBlob = await sigRes.blob();
      const sigArrayBuffer = await sigBlob.arrayBuffer();
      
      // 2. Load PDF file binary
      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      
      // 3. Parse Document with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const targetPage = pages[currentPage - 1];
      
      // 4. Embed the signature PNG image into the PDF
      const embeddedSig = await pdfDoc.embedPng(sigArrayBuffer);
      
      // 5. Convert viewport percentages to actual PDF coordinates (Points)
      // PDF page standard size (Points): A4 is typically 595.27 x 841.89
      const pdfWidth = targetPage.getWidth();
      const pdfHeight = targetPage.getHeight();
      
      // Map screen percentages to PDF coordinate positions
      const actualX = (sigPosition.x / 100) * pdfWidth;
      
      // Note: PDF coordinate system starts at Bottom-Left (Cartesian)
      // Screen coordinate system starts at Top-Left. So we must invert Y coordinates:
      const screenPctY = sigPosition.y / 100;
      const screenPctHeight = sigSize.height / (pdfDimensions.height * renderScale);
      
      const actualY = pdfHeight - (screenPctY * pdfHeight) - (screenPctHeight * pdfHeight);
      const actualWidth = (sigSize.width / (pdfDimensions.width * renderScale)) * pdfWidth;
      const actualHeight = (sigSize.height / (pdfDimensions.height * renderScale)) * pdfHeight;
      
      // Draw signature image
      targetPage.drawImage(embeddedSig, {
        x: actualX,
        y: actualY,
        width: actualWidth,
        height: actualHeight,
      });
      
      // 6. Save PDF and download
      const signedPdfBytes = await pdfDoc.save();
      const signedBlob = new Blob([signedPdfBytes as any], { type: "application/pdf" });
      const signedUrl = URL.createObjectURL(signedBlob);
      
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = `${pdfFile.name.replace(".pdf", "")}-signe.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success feedback
      alert("Votre PDF a été signé et téléchargé avec succès !");
    } catch (err) {
      console.error("Failed to sign PDF:", err);
      alert("Erreur lors de la signature du PDF. Veuillez vérifier l'image de signature ou le fichier PDF.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Branding */}
      <div className="flex items-center gap-3 mb-8">
        <span className="h-px w-10 bg-amber-600" />
        <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-700">SignEase 1.0</p>
        <h2 className="text-4xl font-black tracking-tight text-stone-900">
          Signature Électronique Persistante
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Signature Creator & Options */}
        <div className="lg:col-span-1 space-y-6">
          {/* Signature Storage Manager */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <PenTool className="text-amber-600 h-5 w-5" />
              1. Ta Signature Persistante
            </h3>
            
            {isLoadingSignature ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
              </div>
            ) : savedSignatureExists && savedSignatureUrl && !isDrawing ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Signature Enregistrée</p>
                  <Image 
                    src={savedSignatureUrl} 
                    alt="Signature admin" 
                    width={200}
                    height={100}
                    unoptimized
                    className="max-h-24 object-contain max-w-full mix-blend-multiply filter contrast-125"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDrawing(true)}
                    className="w-full rounded-full border border-stone-200 bg-white hover:bg-stone-50 py-2.5 text-xs font-semibold text-stone-700 transition"
                  >
                    Redessiner la signature
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous positionner cette signature sur votre PDF ?")) {
                        setOverlayPlaced(true);
                      }
                    }}
                    disabled={!pdfFile}
                    className="w-full rounded-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Placer sur le PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-1">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    canvasProps={{
                      className: "signature-canvas w-full h-40 rounded-2xl bg-white",
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="w-1/3 rounded-full border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 py-2.5 text-xs font-semibold text-stone-600 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={13} />
                    Effacer
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    className="w-2/3 rounded-full bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check size={14} />
                    Sauvegarder sur le serveur
                  </button>
                </div>
                {savedSignatureExists && (
                  <button
                    type="button"
                    onClick={() => setIsDrawing(false)}
                    className="w-full rounded-full border border-stone-200 bg-white py-2 text-xs text-stone-400 hover:text-stone-600 transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PDF Uploader Card */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <FileUp className="text-amber-600 h-5 w-5" />
              2. Charger le Document
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition p-4 text-center">
              <FileUp className="h-8 w-8 text-stone-400 mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-stone-700">Sélectionner une facture ou attestation</p>
              <p className="text-[10px] text-stone-400 mt-1 font-mono">Format PDF uniquement</p>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {pdfFile && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{pdfFile.name}</p>
                  <p className="text-stone-500 font-mono mt-0.5">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => {
                    setPdfFile(null);
                    setPdfUrl(null);
                    setOverlayPlaced(false);
                  }}
                  className="rounded-full hover:bg-amber-100 p-1 text-stone-500 hover:text-rose-600 transition"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Action box when signature placed */}
          {overlayPlaced && pdfFile && (
            <div className="rounded-3xl border border-stone-200 bg-amber-50/40 p-6 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-600">
                3. Finaliser le document
              </h3>
              <p className="text-xs text-stone-500 leading-normal">
                Déplacez la signature sur le document avec votre souris ou doigt, ajustez sa taille si besoin, puis cliquez ci-dessous.
              </p>
              
              {/* Signature Resizing Control Toolbar */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-3 flex items-center justify-between gap-2 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Taille</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleResize(-20)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
                    title="Diminuer la taille"
                  >
                    <Minimize2 size={13} />
                  </button>
                  <span className="text-xs font-mono font-semibold px-2 py-1 bg-stone-50 rounded-lg text-stone-600">
                    {sigSize.width}px
                  </span>
                  <button 
                    onClick={() => handleResize(20)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600"
                    title="Agrandir la taille"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSignPDF}
                disabled={isSigning}
                className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-3.5 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isSigning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signature en cours...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Appliquer la signature & Télécharger
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right column: Document Interactive Viewer Stage */}
        <div className="lg:col-span-2">
          {pdfUrl ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-100 p-6 flex flex-col items-center">
              {/* Toolbar */}
              <div className="w-full bg-white rounded-2xl border border-stone-200/80 p-3 mb-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">Page {currentPage}</span> / {numPages}
                </div>
                
                <div className="flex gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 disabled:opacity-40 transition"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Viewport container */}
              <div 
                ref={pdfWrapperRef}
                className="relative bg-white shadow-xl rounded-2xl overflow-hidden max-w-full border border-stone-200/50"
                style={{ minHeight: "350px", width: "500px" }}
              >
                <Document 
                  file={pdfUrl} 
                  onLoadSuccess={handleDocumentLoadSuccess}
                  loading={
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                    </div>
                  }
                >
                  <Page 
                    pageNumber={currentPage} 
                    width={500} 
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    onRenderSuccess={handlePageRenderSuccess}
                    loading=""
                  />
                </Document>

                {/* Drag and Drop Signature Overlay */}
                {overlayPlaced && savedSignatureUrl && (
                  <div
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="absolute cursor-move border-2 border-dashed border-amber-500 bg-amber-50/20 shadow-md group select-none flex items-center justify-center p-0.5 rounded-lg active:border-emerald-500"
                    style={{
                      left: `${sigPosition.x}%`,
                      top: `${sigPosition.y}%`,
                      width: `${sigSize.width}px`,
                      height: `${sigSize.height}px`,
                      touchAction: "none"
                    }}
                  >
                    {/* Drag indicator icon */}
                    <div className="absolute -top-3.5 -left-3.5 bg-amber-600 text-white rounded-full p-1 shadow-sm flex items-center justify-center cursor-move">
                      <Move size={10} />
                    </div>
                    
                    {/* Trash remove overlay button */}
                    <button
                      onClick={() => setOverlayPlaced(false)}
                      className="absolute -top-3.5 -right-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-sm flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>

                    <Image 
                      src={savedSignatureUrl} 
                      alt="Signature placement overlay" 
                      width={150}
                      height={75}
                      unoptimized
                      className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white h-[500px] flex flex-col items-center justify-center text-center p-8">
              <FileUp className="h-16 w-16 text-stone-300 mb-4 animate-pulse" />
              <h4 className="text-base font-bold text-stone-800">Aucun document chargé</h4>
              <p className="text-xs text-stone-400 mt-2 max-w-sm leading-normal">
                Chargez une facture ou une attestation fiscale à l&apos;aide du volet de gauche, puis glissez-déposez votre signature pour signer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
