"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  sources: string[]
  className?: string
  poster?: string
  muted?: boolean
}

function toDriveDirect(link: string) {
  try {
    const url = new URL(link)
    const id = url.searchParams.get("id")
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`
  } catch {}
  return link
}

export function VideoPlaylist({ sources, className, poster, muted = true }: Props) {
  const prepared = useMemo(() => sources.map(toDriveDirect), [sources])
  const [index, setIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const playCurrent = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    // Attempt autoplay after source changes
    const p = el.play()
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // Some browsers require a user gesture; we stay silent.
      })
    }
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.load()
    const onCanPlay = () => playCurrent()
    el.addEventListener("canplay", onCanPlay)
    playCurrent()
    return () => el.removeEventListener("canplay", onCanPlay)
  }, [index, playCurrent])

  const handleEnded = useCallback(() => {
    setIndex((i) => (i + 1) % prepared.length)
  }, [prepared.length])

  const handleError = useCallback(() => {
    // Skip to next on error to keep loop alive
    setIndex((i) => (i + 1) % prepared.length)
  }, [prepared.length])

  return (
    <video
      key={index}
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      src={prepared[index]}
      poster={poster}
      autoPlay
      muted={muted}
      playsInline
      controls={false}
      onEnded={handleEnded}
      onError={handleError}
      preload="metadata"
    />
  )
}
