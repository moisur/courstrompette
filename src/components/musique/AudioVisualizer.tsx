import React, { useRef, useEffect, useCallback } from "react";

interface AudioVisualizerProps {
  audioStream: MediaStream;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!audioStream) return;

    // Initialisation du contexte audio
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    audioContextRef.current = new AudioContextClass();
    const audioSource = audioContextRef.current.createMediaStreamSource(audioStream);

    // Création d'un analyser
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    audioSource.connect(analyserRef.current);

    // Nettoyage
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      audioContextRef.current?.close();
    };
  }, [audioStream]);

  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    // Nettoyage du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Affichage des données brutes
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 255, 0)";
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] * 200.0;
      const y = canvas.height / 2 + v;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Dessiner le prochain frame
    animationFrameId.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);

  return <canvas ref={canvasRef} width={800} height={400} style={{ border: "1px solid black" }} />;
};

export default AudioVisualizer;

