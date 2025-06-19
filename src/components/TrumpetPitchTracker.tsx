// TrumpetPitchTracker.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PitchDetector } from "pitchy";

// Configuration
const A4_FREQUENCY = 440.0;
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MIN_CLARITY_THRESHOLD = 0.8; // Essayez 0.7 ou 0.6 si vous n'obtenez rien
const FFT_SIZE = 4096;

interface DetectedNoteInfo {
  frequency: number | null;
  noteName: string | null;
  octave: number | null;
  centsOffset: number | null;
  clarity: number | null;
}

interface PitchyInstanceCallable {
  (input: Float32Array, optionalClarityThreshold?: number): [
    number | null,
    number
  ];
}

const frequencyToNoteAndCents = (
  frequency: number
): Omit<DetectedNoteInfo, "clarity" | "frequency"> & { frequency: number } => {
  if (frequency <= 0) {
    return { frequency, noteName: null, octave: null, centsOffset: null };
  }
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / A4_FREQUENCY));
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = NOTES[noteIndex < 0 ? noteIndex + 12 : noteIndex];
  const closestExactFrequency =
    A4_FREQUENCY * Math.pow(2, (midiNote - 69) / 12);
  const centsOffset = 1200 * Math.log2(frequency / closestExactFrequency);
  return { frequency, noteName, octave, centsOffset: Math.round(centsOffset) };
};

const TrumpetPitchTracker: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedNote, setDetectedNote] = useState<DetectedNoteInfo>({
    frequency: null,
    noteName: null,
    octave: null,
    centsOffset: null,
    clarity: null,
  });
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pitchDetectorRef = useRef<PitchyInstanceCallable | null>(null); // Type pour un objet callable
  const dataArrayRef = useRef<Float32Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const updatePitch = useCallback(() => {
    // console.log(
    //     `UPDATE_PITCH CHECK: isListening(ref)=${isListeningRef.current}, audioCtx=${!!audioContextRef.current}, audioCtxState=${audioContextRef.current?.state}, analyser=${!!analyserNodeRef.current}, dataArray=${!!dataArrayRef.current}, pitchDetector=${!!pitchDetectorRef.current}`
    // );

    if (
      !isListeningRef.current ||
      !audioContextRef.current ||
      audioContextRef.current.state !== "running" ||
      !analyserNodeRef.current ||
      !dataArrayRef.current ||
      !pitchDetectorRef.current // S'assurer que la ref du détecteur est initialisée
    ) {
      // console.log("UPDATE_PITCH: Returning early due to guard condition.");
      if (animationFrameIdRef.current && !isListeningRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    analyserNodeRef.current.getFloatTimeDomainData(dataArrayRef.current);

    let sumAbs = 0;
    if (dataArrayRef.current) {
      for (let i = 0; i < Math.min(100, dataArrayRef.current.length); i++) {
        sumAbs += Math.abs(dataArrayRef.current[i]);
      }
      if (sumAbs > 0.001) {
        // Log only if there's some signal
        console.log(`DEBUG AUDIO: Signal sum: ${sumAbs.toFixed(5)}`);
      }
    }

    // --- LOG CRITIQUE AVANT APPEL ---
    const currentDetector = pitchDetectorRef.current;
    console.log(
      `PRE-CALL PITCH_DETECTOR: typeof=${typeof currentDetector}, value=`,
      currentDetector
    );
    // --- FIN LOG CRITIQUE ---

    if (typeof currentDetector !== "function") {
      console.error(
        "CRITICAL ERROR: pitchDetectorRef.current IS NOT A FUNCTION right before call. Stopping."
      );
      // Optionnel : arrêter l'écoute ici pour éviter des erreurs répétées
      // stopListening(); // Attention, stopListening est async, il faudrait le gérer différemment ici
      setIsListening(false); // Au moins, arrêter la logique de boucle
      isListeningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      setError("Internal pitch detector error. Please restart.");
      return;
    }

    const result = currentDetector(dataArrayRef.current); // Appel direct, en supposant qu'il est callable
    const [pitch, clarity] = result;

    console.log(
      `ALWAYS DEBUG PITCHY - Pitch: ${
        pitch ? pitch.toFixed(2) : "null"
      }, Clarity: ${clarity.toFixed(3)}`
    );

    if (pitch && clarity > MIN_CLARITY_THRESHOLD) {
      const noteInfo = frequencyToNoteAndCents(pitch);
      setDetectedNote({ ...noteInfo, clarity });
    } else if (pitch) {
      const noteInfo = frequencyToNoteAndCents(pitch);
      setDetectedNote({ ...noteInfo, clarity });
    } else {
      setDetectedNote({
        frequency: null,
        noteName: null,
        octave: null,
        centsOffset: null,
        clarity: clarity > 0 ? clarity : null,
      });
    }

    if (isListeningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(updatePitch);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // `isListening` n'est pas une dépendance, on utilise `isListeningRef`

  const stopListening = useCallback(async () => {
    console.log("Stopping listening...");
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);

    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (analyserNodeRef.current) analyserNodeRef.current.disconnect();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        await audioContextRef.current.close();
        console.log("AudioContext closed.");
      } catch (e) {
        console.error("Error closing AudioContext:", e);
      }
    }

    sourceNodeRef.current = null;
    analyserNodeRef.current = null;
    audioContextRef.current = null;
    pitchDetectorRef.current = null; // S'assurer qu'il est nullifié
    dataArrayRef.current = null;

    setDetectedNote({
      frequency: null,
      noteName: null,
      octave: null,
      centsOffset: null,
      clarity: null,
    });
    console.log("Listening stopped, state reset.");
  }, []);

  const startListening = async () => {
    setError(null);
    if (
      isListeningRef.current &&
      audioContextRef.current &&
      audioContextRef.current.state === "running"
    ) {
      console.warn(
        "Already listening (ref check) and AudioContext is running."
      );
      return;
    }

    if (audioContextRef.current) {
      console.warn("Cleaning up existing audio context before starting.");
      await stopListening();
    }

    try {
      console.log("Attempting to start listening...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaStreamRef.current = stream;
      console.log("Microphone stream acquired.");

      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      if (context.state === "suspended") {
        await context.resume();
      }
      console.log("AudioContext state:", context.state);

      sourceNodeRef.current = context.createMediaStreamSource(stream);
      analyserNodeRef.current = context.createAnalyser();
      analyserNodeRef.current.fftSize = FFT_SIZE;
      sourceNodeRef.current.connect(analyserNodeRef.current);
      dataArrayRef.current = new Float32Array(analyserNodeRef.current.fftSize);
      console.log("Audio nodes set up.");

      const detectorInstance = PitchDetector.forFloat32Array(
        analyserNodeRef.current.fftSize
      );

      if (!detectorInstance) {
        throw new Error(
          "PitchDetector.forFloat32Array returned null or undefined."
        );
      }
      console.log(
        "PitchDetector instance created. Raw instance:",
        detectorInstance,
        "typeof:",
        typeof detectorInstance
      );

      // C'est ici que le typage est forcé.
      // Si `detectorInstance` n'est pas réellement une fonction au runtime, l'appel échouera.
      pitchDetectorRef.current =
        detectorInstance as unknown as PitchyInstanceCallable;
      console.log(
        "Assigned to pitchDetectorRef.current. Value after cast:",
        pitchDetectorRef.current,
        "typeof after cast:",
        typeof pitchDetectorRef.current
      );

      setIsListening(true);
      isListeningRef.current = true;

      console.log("Starting animation frame loop for pitch detection.");
      if (animationFrameIdRef.current)
        cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = requestAnimationFrame(updatePitch);
    } catch (err: any) {
      console.error("Error starting listening:", err);
      let userMessage = "Mic/Audio init failed.";
      if (err.name === "NotAllowedError")
        userMessage = "Permission to use microphone was denied.";
      else if (err.name === "NotFoundError")
        userMessage = "No microphone found.";
      setError(userMessage);

      // Cleanup
      if (mediaStreamRef.current)
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        try {
          await audioContextRef.current.close();
        } catch (e) {}
      }
      mediaStreamRef.current = null;
      audioContextRef.current = null;
      pitchDetectorRef.current = null; // Important de nullifier en cas d'erreur
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      console.log("TrumpetPitchTracker unmounting, ensuring cleanup.");
      stopListening();
    };
  }, [stopListening]);

  const getCentsIndicatorStyle = (
    cents: number | null
  ): React.CSSProperties => {
    if (cents === null)
      return { transform: "translateX(-50%)", backgroundColor: "lightgray" };
    const maxOffset = 50;
    const clampedCents = Math.max(-maxOffset, Math.min(maxOffset, cents));
    const percentage = (clampedCents + maxOffset) / (2 * maxOffset);
    let color = "green";
    if (Math.abs(cents) > 10 && Math.abs(cents) <= 25) color = "orange";
    else if (Math.abs(cents) > 25) color = "red";
    return {
      transform: `translateX(calc(${percentage * 100}% - 50%))`,
      backgroundColor: color,
    };
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "20px auto",
      }}
    >
      <h2>Détecteur de Hauteur pour Trompette</h2>
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={
          isListening &&
          (!audioContextRef.current ||
            audioContextRef.current.state !== "running")
        }
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        {isListening ? "Arrêter l'écoute" : "Démarrer l'écoute"}
      </button>
      {error && (
        <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
          {error}
        </p>
      )}
      {isListening && !error && (
        <div>
          <p style={{ fontSize: "24px", margin: "10px 0", minHeight: "36px" }}>
            Note:{" "}
            <strong style={{ minWidth: "80px", display: "inline-block" }}>
              {detectedNote.noteName
                ? `${detectedNote.noteName}${detectedNote.octave}`
                : "---"}
            </strong>
          </p>
          <p style={{ fontSize: "16px", margin: "5px 0", minHeight: "24px" }}>
            Fréquence:{" "}
            {detectedNote.frequency
              ? `${detectedNote.frequency.toFixed(1)} Hz`
              : "---"}
          </p>
          <p style={{ fontSize: "16px", margin: "5px 0", minHeight: "24px" }}>
            Clarté:{" "}
            {detectedNote.clarity !== null
              ? `${(detectedNote.clarity * 100).toFixed(0)}%`
              : "---"}
            {detectedNote.clarity !== null &&
              detectedNote.clarity < MIN_CLARITY_THRESHOLD &&
              detectedNote.noteName && (
                <span style={{ color: "orange", marginLeft: "10px" }}>
                  (Signal faible/instable)
                </span>
              )}
          </p>
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "16px", margin: "5px 0", minHeight: "24px" }}>
              Justesse (cents):{" "}
              {detectedNote.centsOffset !== null
                ? `${detectedNote.centsOffset}`
                : "---"}
            </p>
            <div
              style={{
                width: "80%",
                margin: "10px auto",
                height: "20px",
                backgroundColor: "#eee",
                borderRadius: "10px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: "2px",
                  backgroundColor: "#aaa",
                  transform: "translateX(-50%)",
                }}
              ></div>
              {detectedNote.centsOffset !== null && (
                <div
                  style={{
                    width: "10px",
                    height: "100%",
                    borderRadius: "5px",
                    position: "absolute",
                    left: "0%",
                    transition:
                      "transform 0.05s linear, background-color 0.05s linear",
                    ...getCentsIndicatorStyle(detectedNote.centsOffset),
                  }}
                ></div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "80%",
                margin: "0 auto",
                fontSize: "12px",
              }}
            >
              <span>-50c</span>
              <span>0c</span>
              <span>+50c</span>
            </div>
          </div>
        </div>
      )}
      {!isListening && !error && (
        <p>Cliquez sur &quot;Démarrer l&apos;écoute&quot; pour commencer.</p>
      )}
    </div>
  );
};

export default TrumpetPitchTracker;
