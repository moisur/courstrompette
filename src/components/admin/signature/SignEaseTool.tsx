"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Minimize2,
  Plus,
  Sparkles,
  Layers,
  FileCheck
} from "lucide-react";

// Serve the pdfjs worker from /public so it stays same-origin and CSP-compliant.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface PlacedStamp {
  id: string;
  type: "signature" | "paraphe";
  pageNumber: number; // 1-indexed
  x: number; // percentage in container (0-100)
  y: number; // percentage in container (0-100)
  width: number; // pixels rendered on screen
  height: number; // pixels rendered on screen
}

export interface SignEaseToolProps {
  initialPdfFile?: File | null;
}

export function SignEaseTool({ initialPdfFile = null }: SignEaseToolProps) {
  // Signature management states
  const [activeTab, setActiveTab] = useState<"signature" | "paraphe">("signature");
  
  const [savedSignatureUrl, setSavedSignatureUrl] = useState<string | null>(null);
  const [savedSignatureExists, setSavedSignatureExists] = useState(false);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  const [savedParapheUrl, setSavedParapheUrl] = useState<string | null>(null);
  const [savedParapheExists, setSavedParapheExists] = useState(false);
  const [isDrawingPar, setIsDrawingPar] = useState(false);

  const [isLoadingSignatures, setIsLoadingSignatures] = useState(true);
  
  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(initialPdfFile);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfFile ? URL.createObjectURL(initialPdfFile) : null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [renderScale, setRenderScale] = useState<number>(1.0);
  
  // Multi-stamp placement states
  const [placedStamps, setPlacedStamps] = useState<PlacedStamp[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Drag & Resize tracking
  const [activeDrag, setActiveDrag] = useState<{
    stampId: string;
    startMouseX: number;
    startMouseY: number;
    startStampX: number;
    startStampY: number;
  } | null>(null);

  const [activeResize, setActiveResize] = useState<{
    stampId: string;
    startMouseX: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
  } | null>(null);

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const parCanvasRef = useRef<SignatureCanvas>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  // Load existing signature & paraphe from server
  useEffect(() => {
    fetchSignatures();
  }, []);

  // Sync initial PDF file changes
  useEffect(() => {
    if (initialPdfFile) {
      const url = URL.createObjectURL(initialPdfFile);
      setPdfFile(initialPdfFile);
      setPdfUrl(url);
      setCurrentPage(1);
      setPlacedStamps([]);
      setSelectedStampId(null);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [initialPdfFile]);

  const fetchSignatures = async () => {
    setIsLoadingSignatures(true);
    try {
      const res = await fetch("/api/admin/signature");
      const data = await res.json();
      if (data.signature?.exists && data.signature?.url) {
        setSavedSignatureUrl(data.signature.url);
        setSavedSignatureExists(true);
      } else if (data.exists && data.url) {
        setSavedSignatureUrl(data.url);
        setSavedSignatureExists(true);
      } else {
        setSavedSignatureExists(false);
      }

      if (data.paraphe?.exists && data.paraphe?.url) {
        setSavedParapheUrl(data.paraphe.url);
        setSavedParapheExists(true);
      } else {
        setSavedParapheExists(false);
      }
    } catch (err) {
      console.error("Error loading signatures:", err);
    } finally {
      setIsLoadingSignatures(false);
    }
  };

  // Save hand-drawn signature or paraphe to server
  const handleSaveDrawing = async (type: "signature" | "paraphe") => {
    const canvas = type === "signature" ? sigCanvasRef.current : parCanvasRef.current;
    if (!canvas || canvas.isEmpty()) return;
    
    setIsLoadingSignatures(true);
    const dataUrl = canvas.getTrimmedCanvas().toDataURL("image/png");
    
    try {
      const res = await fetch("/api/admin/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type }),
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        if (type === "signature") {
          setSavedSignatureUrl(data.url);
          setSavedSignatureExists(true);
          setIsDrawingSig(false);
        } else {
          setSavedParapheUrl(data.url);
          setSavedParapheExists(true);
          setIsDrawingPar(false);
        }
      } else {
        alert(data.error || "Impossible de sauvegarder.");
      }
    } catch (err) {
      console.error(`Error saving ${type}:`, err);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsLoadingSignatures(false);
    }
  };

  // PDF File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setCurrentPage(1);
      setPlacedStamps([]);
      setSelectedStampId(null);
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

  // Add a stamp (signature or paraphe) on the current page
  const handleAddStamp = (type: "signature" | "paraphe") => {
    if (!pdfFile) return;
    const isParaphe = type === "paraphe";
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newStamp: PlacedStamp = {
      id,
      type,
      pageNumber: currentPage,
      x: isParaphe ? 72 : 40,
      y: isParaphe ? 85 : 68,
      width: isParaphe ? 95 : 155,
      height: isParaphe ? 48 : 75,
    };

    setPlacedStamps((prev) => [...prev, newStamp]);
    setSelectedStampId(id);
  };

  // Quick 1-click batch: paraph all pages at bottom-right
  const handleParaphAllPages = () => {
    if (!pdfFile || numPages <= 0) return;
    const effectiveUrl = savedParapheUrl || savedSignatureUrl;
    if (!effectiveUrl) {
      alert("Veuillez enregistrer une signature ou un paraphe au préalable.");
      return;
    }

    const newStamps: PlacedStamp[] = [];
    for (let p = 1; p <= numPages; p++) {
      newStamps.push({
        id: `paraphe-p${p}-${Date.now()}`,
        type: "paraphe",
        pageNumber: p,
        x: 72, // bottom right
        y: 86,
        width: 95,
        height: 48,
      });
    }

    // Keep existing signatures and replace any existing paraphes
    setPlacedStamps((prev) => {
      const withoutOldParaphes = prev.filter((s) => s.type !== "paraphe");
      return [...withoutOldParaphes, ...newStamps];
    });

    alert(`Paraphe apposé en bas à droite sur les ${numPages} pages !`);
  };

  // Delete a stamp
  const handleDeleteStamp = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlacedStamps((prev) => prev.filter((s) => s.id !== id));
    if (selectedStampId === id) setSelectedStampId(null);
  };

  // Quick resize button (+/- amount)
  const handleResizeStamp = (id: string, deltaPx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlacedStamps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const ratio = s.width / s.height;
        const newWidth = Math.max(50, Math.min(360, s.width + deltaPx));
        const newHeight = Math.max(25, Math.min(220, Math.round(newWidth / ratio)));
        return { ...s, width: newWidth, height: newHeight };
      })
    );
  };

  // Mouse / Touch drag handling
  const handleStampMouseDown = (e: React.MouseEvent, stamp: PlacedStamp) => {
    e.stopPropagation();
    setSelectedStampId(stamp.id);
    setActiveDrag({
      stampId: stamp.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startStampX: stamp.x,
      startStampY: stamp.y,
    });
  };

  const handleCornerResizeMouseDown = (e: React.MouseEvent, stamp: PlacedStamp) => {
    e.stopPropagation();
    setSelectedStampId(stamp.id);
    setActiveResize({
      stampId: stamp.id,
      startMouseX: e.clientX,
      startWidth: stamp.width,
      startHeight: stamp.height,
      aspectRatio: stamp.width / stamp.height,
    });
  };

  // Window global listeners for smooth dragging & corner resizing
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (activeResize && pdfWrapperRef.current) {
        const deltaX = e.clientX - activeResize.startMouseX;
        const newWidth = Math.max(50, Math.min(380, activeResize.startWidth + deltaX));
        const newHeight = Math.max(25, Math.min(240, Math.round(newWidth / activeResize.aspectRatio)));
        
        setPlacedStamps((prev) =>
          prev.map((s) => (s.id === activeResize.stampId ? { ...s, width: newWidth, height: newHeight } : s))
        );
      } else if (activeDrag && pdfWrapperRef.current) {
        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const stamp = placedStamps.find((s) => s.id === activeDrag.stampId);
        if (!stamp) return;

        const deltaPxX = e.clientX - activeDrag.startMouseX;
        const deltaPxY = e.clientY - activeDrag.startMouseY;
        const deltaPctX = (deltaPxX / rect.width) * 100;
        const deltaPctY = (deltaPxY / rect.height) * 100;

        const maxPctX = Math.max(0, 100 - (stamp.width / rect.width) * 100);
        const maxPctY = Math.max(0, 100 - (stamp.height / rect.height) * 100);

        const newX = Math.max(0, Math.min(maxPctX, activeDrag.startStampX + deltaPctX));
        const newY = Math.max(0, Math.min(maxPctY, activeDrag.startStampY + deltaPctY));

        setPlacedStamps((prev) =>
          prev.map((s) => (s.id === activeDrag.stampId ? { ...s, x: newX, y: newY } : s))
        );
      }
    };

    const handleWindowMouseUp = () => {
      if (activeResize) setActiveResize(null);
      if (activeDrag) setActiveDrag(null);
    };

    if (activeResize || activeDrag) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [activeResize, activeDrag, placedStamps]);

  // Real core implementation of PDF embedding across all pages
  const handleSignPDF = async () => {
    if (!pdfFile || placedStamps.length === 0 || !pdfDimensions) {
      alert("Veuillez placer au moins une signature ou un paraphe avant d'exporter.");
      return;
    }

    const defaultSigUrl = savedSignatureUrl || savedParapheUrl;
    if (!defaultSigUrl) {
      alert("Aucune image de signature disponible.");
      return;
    }

    setIsSigning(true);
    
    try {
      // 1. Fetch signature image binary
      const sigRes = await fetch(defaultSigUrl);
      if (!sigRes.ok) {
        throw new Error(`Impossible de charger l'image de signature (HTTP ${sigRes.status})`);
      }
      const sigBlob = await sigRes.blob();
      const sigArrayBuffer = await sigBlob.arrayBuffer();

      // 2. Load PDF file binary
      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      
      // 3. Parse Document with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      
      // 4. Embed main signature image into PDF
      const embeddedSig = await pdfDoc.embedPng(sigArrayBuffer);

      // 5. Only fetch and embed paraphe if there are actually paraphes placed on the document
      const hasParapheStamps = placedStamps.some((s) => s.type === "paraphe");
      let embeddedParaphe = embeddedSig;

      if (hasParapheStamps && savedParapheUrl && savedParapheUrl !== defaultSigUrl) {
        try {
          const parRes = await fetch(savedParapheUrl);
          if (parRes.ok) {
            const parBlob = await parRes.blob();
            const parArrayBuffer = await parBlob.arrayBuffer();
            embeddedParaphe = await pdfDoc.embedPng(parArrayBuffer);
          }
        } catch (parErr) {
          console.warn("Could not embed custom paraphe, fallback to signature:", parErr);
          embeddedParaphe = embeddedSig;
        }
      }
      
      // 6. Draw each placed stamp on its corresponding page
      for (const stamp of placedStamps) {
        if (stamp.pageNumber > pages.length) continue;
        const targetPage = pages[stamp.pageNumber - 1];
        const pdfWidth = targetPage.getWidth();
        const pdfHeight = targetPage.getHeight();
        
        const actualX = (stamp.x / 100) * pdfWidth;
        const screenPctY = stamp.y / 100;
        const screenPctHeight = stamp.height / (pdfDimensions.height * renderScale);
        
        const actualY = pdfHeight - (screenPctY * pdfHeight) - (screenPctHeight * pdfHeight);
        const actualWidth = (stamp.width / (pdfDimensions.width * renderScale)) * pdfWidth;
        const actualHeight = (stamp.height / (pdfDimensions.height * renderScale)) * pdfHeight;
        
        const imgToDraw = stamp.type === "paraphe" ? embeddedParaphe : embeddedSig;
        targetPage.drawImage(imgToDraw, {
          x: actualX,
          y: actualY,
          width: actualWidth,
          height: actualHeight,
        });
      }
      
      // 7. Save and download
      const signedPdfBytes = await pdfDoc.save();
      const signedBlob = new Blob([signedPdfBytes as any], { type: "application/pdf" });
      const signedUrl = URL.createObjectURL(signedBlob);
      
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = `${pdfFile.name.replace(".pdf", "")}-signe.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Votre document a été signé avec succès (${placedStamps.length} emplacement(s) sur ${numPages} page(s)) !`);
    } catch (err) {
      console.error("Failed to sign PDF:", err);
      alert("Erreur lors de la signature du PDF. Veuillez vérifier l'image de signature ou le fichier PDF.");
    } finally {
      setIsSigning(false);
    }
  };

  const currentStamps = placedStamps.filter((s) => s.pageNumber === currentPage);
  const selectedStamp = placedStamps.find((s) => s.id === selectedStampId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Branding */}
      <div className="flex items-center gap-3 mb-8">
        <span className="h-px w-10 bg-amber-600" />
        <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-700">SignEase 2.0</p>
        <h2 className="text-4xl font-black tracking-tight text-stone-900">
          Signature & Paraphe Multi-pages
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Signature, Paraphe & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Signature & Paraphe Manager Card */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            {/* Tabs for Signature vs Paraphe */}
            <div className="flex rounded-2xl bg-stone-100 p-1 mb-5">
              <button
                onClick={() => setActiveTab("signature")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "signature"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <PenTool size={13} />
                Signature
              </button>
              <button
                onClick={() => setActiveTab("paraphe")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === "paraphe"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <FileCheck size={13} />
                Paraphe
              </button>
            </div>

            {isLoadingSignatures ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-stone-400" />
              </div>
            ) : activeTab === "signature" ? (
              /* TAB 1: SIGNATURE */
              savedSignatureExists && savedSignatureUrl && !isDrawingSig ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Signature Principale</p>
                    <Image 
                      src={savedSignatureUrl} 
                      alt="Signature admin" 
                      width={180}
                      height={90}
                      unoptimized
                      onError={() => setSavedSignatureExists(false)}
                      className="max-h-20 object-contain max-w-full mix-blend-multiply filter contrast-125"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsDrawingSig(true)}
                      className="w-1/2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 py-2.5 text-xs font-semibold text-stone-700 transition"
                    >
                      Redessiner
                    </button>
                    <button
                      onClick={() => handleAddStamp("signature")}
                      disabled={!pdfFile}
                      className="w-1/2 rounded-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus size={13} />
                      Placer (p.{currentPage})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-stone-500">Dessinez votre signature complète :</p>
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-1">
                    <SignatureCanvas
                      ref={sigCanvasRef}
                      canvasProps={{
                        className: "signature-canvas w-full h-36 rounded-2xl bg-white",
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => sigCanvasRef.current?.clear()}
                      className="w-1/3 rounded-full border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-600 py-2 text-xs font-semibold text-stone-600 transition"
                    >
                      Effacer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDrawing("signature")}
                      className="w-2/3 rounded-full bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1"
                    >
                      <Check size={13} />
                      Sauvegarder
                    </button>
                  </div>
                  {savedSignatureExists && (
                    <button
                      type="button"
                      onClick={() => setIsDrawingSig(false)}
                      className="w-full text-center text-xs text-stone-400 hover:text-stone-600"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              )
            ) : (
              /* TAB 2: PARAPHE */
              savedParapheExists && savedParapheUrl && !isDrawingPar ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Paraphe Enregistré (Initiales)</p>
                    <Image 
                      src={savedParapheUrl} 
                      alt="Paraphe admin" 
                      width={120}
                      height={60}
                      unoptimized
                      onError={() => setSavedParapheExists(false)}
                      className="max-h-16 object-contain max-w-full mix-blend-multiply filter contrast-125"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsDrawingPar(true)}
                      className="w-1/2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 py-2.5 text-xs font-semibold text-stone-700 transition"
                    >
                      Redessiner
                    </button>
                    <button
                      onClick={() => handleAddStamp("paraphe")}
                      disabled={!pdfFile}
                      className="w-1/2 rounded-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus size={13} />
                      Placer (p.{currentPage})
                    </button>
                  </div>

                  {pdfFile && numPages > 1 && (
                    <button
                      onClick={handleParaphAllPages}
                      className="w-full rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Sparkles size={14} className="text-amber-600" />
                      Parapher toutes les pages ({numPages})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-stone-500">Dessinez votre paraphe (ex: initiales JC) :</p>
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-1">
                    <SignatureCanvas
                      ref={parCanvasRef}
                      canvasProps={{
                        className: "signature-canvas w-full h-32 rounded-2xl bg-white",
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => parCanvasRef.current?.clear()}
                      className="w-1/3 rounded-full border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-600 py-2 text-xs font-semibold text-stone-600 transition"
                    >
                      Effacer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDrawing("paraphe")}
                      className="w-2/3 rounded-full bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1"
                    >
                      <Check size={13} />
                      Sauvegarder
                    </button>
                  </div>
                  {savedSignatureExists && !savedParapheExists && (
                    <button
                      type="button"
                      onClick={() => {
                        setSavedParapheUrl(savedSignatureUrl);
                        setSavedParapheExists(true);
                      }}
                      className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2 text-xs text-stone-600 hover:bg-stone-100"
                    >
                      Utiliser ma signature complète en miniature
                    </button>
                  )}
                  {savedParapheExists && (
                    <button
                      type="button"
                      onClick={() => setIsDrawingPar(false)}
                      className="w-full text-center text-xs text-stone-400 hover:text-stone-600"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* PDF Uploader Card */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
              <FileUp className="text-amber-600 h-5 w-5" />
              2. Document PDF
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition p-3 text-center">
              <FileUp className="h-6 w-6 text-stone-400 mb-1 animate-bounce" />
              <p className="text-xs font-semibold text-stone-700">Changer de facture / attestation</p>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {pdfFile && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{pdfFile.name}</p>
                  <p className="text-stone-500 font-mono mt-0.5">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB · {numPages} page(s)</p>
                </div>
                <button 
                  onClick={() => {
                    setPdfFile(null);
                    setPdfUrl(null);
                    setPlacedStamps([]);
                  }}
                  className="rounded-full hover:bg-amber-100 p-1 text-stone-500 hover:text-rose-600 transition"
                  title="Fermer le document"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Finalize / Download Card */}
          {pdfFile && (
            <div className="rounded-3xl border border-stone-200 bg-amber-50/40 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-600 flex items-center justify-between">
                <span>3. Finaliser</span>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {placedStamps.length} tampon(s)
                </span>
              </h3>

              <div className="text-xs text-stone-600 space-y-1 bg-white/80 p-3 rounded-2xl border border-amber-100">
                <p>• <strong>Signatures :</strong> {placedStamps.filter((s) => s.type === "signature").length}</p>
                <p>• <strong>Paraphes :</strong> {placedStamps.filter((s) => s.type === "paraphe").length}</p>
                <p>• <strong>Pages couvertes :</strong> {new Set(placedStamps.map((s) => s.pageNumber)).size} / {numPages}</p>
              </div>

              {/* Selected Stamp Size Controls in Sidebar */}
              {selectedStamp && (
                <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">Taille de l&apos;élément actif :</span>
                    <span className="font-mono text-stone-500">{selectedStamp.width}px</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleResizeStamp(selectedStamp.id, -20, e)}
                      className="flex-1 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Minimize2 size={12} /> Plus petit
                    </button>
                    <button
                      onClick={(e) => handleResizeStamp(selectedStamp.id, 20, e)}
                      className="flex-1 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Maximize2 size={12} /> Plus grand
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleSignPDF}
                disabled={isSigning || placedStamps.length === 0}
                className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-3.5 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isSigning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Application en cours...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Appliquer ({placedStamps.length}) & Télécharger
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right column: Interactive Multi-Page Document Stage */}
        <div className="lg:col-span-2">
          {pdfFile || pdfUrl ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-100 p-6 flex flex-col items-center">
              {/* Document Toolbar */}
              <div className="w-full bg-white rounded-2xl border border-stone-200/80 p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                {/* Page navigator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-stone-600 font-medium">
                    <span className="font-bold text-stone-900">Page {currentPage}</span> / {numPages || 1}
                  </div>

                  <div className="flex gap-1 ml-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 disabled:opacity-40 transition"
                      title="Page précédente"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={currentPage >= numPages}
                      onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
                      className="p-1.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 disabled:opacity-40 transition"
                      title="Page suivante"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {currentStamps.length > 0 && (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-2">
                      {currentStamps.length} sur cette page
                    </span>
                  )}
                </div>

                {/* Quick Add Buttons on toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddStamp("signature")}
                    className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={13} /> Signature
                  </button>
                  <button
                    onClick={() => handleAddStamp("paraphe")}
                    className="px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={13} /> Paraphe
                  </button>
                  {numPages > 1 && (
                    <button
                      onClick={handleParaphAllPages}
                      className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1"
                      title="Ajoute un paraphe en bas à droite de toutes les pages"
                    >
                      <Sparkles size={12} className="text-amber-600" /> Parapher tout
                    </button>
                  )}
                </div>
              </div>

              {/* Viewport container */}
              <div 
                ref={pdfWrapperRef}
                className="relative bg-white shadow-xl rounded-2xl overflow-hidden max-w-full border border-stone-200/50 select-none"
                style={{ minHeight: "450px", width: "500px" }}
                onClick={() => setSelectedStampId(null)}
              >
                <Document 
                  file={pdfFile || pdfUrl} 
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={(err) => console.error("Document onLoadError:", err)}
                  loading={
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                    </div>
                  }
                  error={
                    <div className="p-8 text-center text-rose-600 text-sm font-medium">
                      Impossible de charger le document PDF.
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

                {/* Overlaid Stamps for Current Page */}
                {currentStamps.map((stamp) => {
                  const isSelected = selectedStampId === stamp.id;
                  const stampImgUrl = stamp.type === "paraphe" ? (savedParapheUrl || savedSignatureUrl) : savedSignatureUrl;

                  return (
                    <div
                      key={stamp.id}
                      onMouseDown={(e) => handleStampMouseDown(e, stamp)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStampId(stamp.id);
                      }}
                      className={`absolute cursor-move border-2 rounded-lg p-0.5 group transition-shadow ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/30 shadow-lg ring-2 ring-amber-400/30"
                          : "border-dashed border-stone-400/70 hover:border-amber-500 bg-white/10"
                      }`}
                      style={{
                        left: `${stamp.x}%`,
                        top: `${stamp.y}%`,
                        width: `${stamp.width}px`,
                        height: `${stamp.height}px`,
                        touchAction: "none",
                        zIndex: isSelected ? 30 : 10,
                      }}
                    >
                      {/* Floating Quick Action Toolbar */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/90 text-white rounded-full px-2 py-0.5 shadow-md text-[10px] whitespace-nowrap">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-amber-300">
                          {stamp.type === "paraphe" ? "Paraphe" : "Signature"}
                        </span>
                        <span className="text-stone-400">·</span>
                        <button
                          type="button"
                          onClick={(e) => handleResizeStamp(stamp.id, -15, e)}
                          className="hover:text-amber-300 px-1 font-bold"
                          title="Réduire"
                        >
                          -
                        </button>
                        <span className="font-mono text-[9px]">{stamp.width}px</span>
                        <button
                          type="button"
                          onClick={(e) => handleResizeStamp(stamp.id, 15, e)}
                          className="hover:text-amber-300 px-1 font-bold"
                          title="Agrandir"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteStamp(stamp.id, e)}
                          className="hover:text-rose-400 ml-1 text-stone-300"
                          title="Supprimer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>

                      {/* Drag move handle icon */}
                      <div className="absolute -top-2.5 -left-2.5 bg-amber-600 text-white rounded-full p-1 shadow-sm flex items-center justify-center cursor-move">
                        <Move size={9} />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteStamp(stamp.id, e)}
                        className="absolute -top-2.5 -right-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-sm flex items-center justify-center"
                        title="Supprimer ce tampon"
                      >
                        <X size={9} />
                      </button>

                      {/* Signature Image rendering */}
                      {stampImgUrl && (
                        <Image 
                          src={stampImgUrl} 
                          alt={stamp.type} 
                          width={stamp.width}
                          height={stamp.height}
                          unoptimized
                          className="w-full h-full object-contain mix-blend-multiply pointer-events-none select-none"
                        />
                      )}

                      {/* Corner Grab Resize Handle (Bottom-Right) */}
                      <div
                        onMouseDown={(e) => handleCornerResizeMouseDown(e, stamp)}
                        className="absolute -bottom-2 -right-2 w-5 h-5 bg-amber-600 hover:bg-amber-700 text-white rounded-full border-2 border-white shadow-md cursor-se-resize flex items-center justify-center"
                        title="Glisser pour modifier la taille"
                      >
                        <Maximize2 size={9} className="rotate-90" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white h-[500px] flex flex-col items-center justify-center text-center p-8">
              <FileUp className="h-16 w-16 text-stone-300 mb-4 animate-pulse" />
              <h4 className="text-base font-bold text-stone-800">Aucun document chargé</h4>
              <p className="text-xs text-stone-400 mt-2 max-w-sm leading-normal">
                Chargez une facture ou une attestation fiscale à l&apos;aide du volet de gauche pour commencer à signer et parapher.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
