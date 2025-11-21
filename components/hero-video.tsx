'use client'

import { useState, useRef, useEffect } from 'react'

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(true)

  // Simple fixed 5 second overlay. No event listeners, no complex logic.
  useEffect(() => {
    const t = setTimeout(() => setOverlayVisible(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
      {/* Video element uses poster (browser-handled). We avoid JS poster logic to keep things simple. */}
      <video
        ref={videoRef}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        poster="/placeholder.jpg"
        className="h-[420px] w-full object-cover md:h-[520px]"
      >
        <source src="/media/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Timed loading overlay (black + spinner) always shows for first 5s then fades out */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-500 ${overlayVisible ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!overlayVisible}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#333] border-t-[#8BFF61]" />
          <p className="text-xs tracking-wide text-[#8BFF61]/80">Loading Film…</p>
        </div>
      </div>
    </div>
  )
}
