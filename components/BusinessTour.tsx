"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

export function BusinessTour() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMuted = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div className="business-tour">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/businesses/laundry-kiloan.jpg"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/businesses/business-tour.mp4" type="video/mp4" />
      </video>
      <div className="tour-shade" />
      <div className="tour-label"><span>REAL BUSINESS PREVIEW</span><b>7 model usaha Indonesia</b></div>
      <div className="tour-controls">
        <button type="button" onClick={togglePlayback} aria-label={playing ? "Jeda video" : "Putar video"}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button type="button" onClick={toggleMuted} aria-label={muted ? "Aktifkan suara" : "Matikan suara"}>
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>
      <div className="tour-progress" />
    </div>
  );
}
