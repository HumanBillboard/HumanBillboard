'use client'

import { useState, useRef, useEffect } from 'react'

export function HeroVideo() {
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const hideLoading = () => {
      setIsLoading(false)
    }

    // Hide loading on video events
    video.addEventListener('canplay', hideLoading)
    video.addEventListener('playing', hideLoading)
    video.addEventListener('loadeddata', hideLoading)
    
    // Force hide after 5 seconds as fallback
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)
    
    return () => {
      video.removeEventListener('canplay', hideLoading)
      video.removeEventListener('playing', hideLoading)
      video.removeEventListener('loadeddata', hideLoading)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {/* Minimal loading indicator - only shows during initial load */}
      {isLoading && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <div className="h-2 w-2 animate-spin rounded-full border-2 border-[#D9D9D9]/30 border-t-[#8BFF61]" />
          <p className="text-xs text-[#D9D9D9]/40">Loading...</p>
        </div>
      )}

      {/* Video - MP4 only for best performance */}
      <video
        ref={videoRef}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        className="h-[420px] w-full object-cover md:h-[520px]"
        poster="/placeholder.svg?height=560&width=720"
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => setIsLoading(false)}
        onLoadedData={() => setIsLoading(false)}
      >
        {/* MP4 format - optimized for fast loading and smooth playback */}
        <source src="/media/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
