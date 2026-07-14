import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          await videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setHasCamera(false);
        onError('Unable to access camera. Please check permissions.');
      }
    };

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScan(code.data);
            return; // Stop scanning once we find a code
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onError]);

  if (!hasCamera) {
    return (
      <div className="w-full aspect-square bg-leaf-peach/10 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-6 text-center text-slate-500">
        Camera access denied or unavailable.
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 border-4 border-leaf-yellow/50 m-8 rounded-3xl z-10" style={{
        boxShadow: "0 0 0 4000px rgba(0,0,0,0.4)"
      }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="w-48 h-48 border-4 border-white/50 rounded-3xl relative">
          <div className="absolute -inset-1 border-4 border-white rounded-3xl [clip-path:polygon(0_0,20%_0,20%_20%,0_20%,0_0,80%_0,100%_0,100%_20%,80%_20%,80%_0,100%_80%,100%_100%,80%_100%,80%_80%,100%_80%,0_80%,20%_80%,20%_100%,0_100%,0_80%)]" />
        </div>
      </div>
    </div>
  );
}
