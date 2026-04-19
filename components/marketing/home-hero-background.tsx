"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { HOME_MARKETING_HERO_PATH, HOME_MARKETING_HERO_VIDEO_SRC } from "@/lib/ui/home-marketing";

export function HomeHeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || useFallbackImage) return;

    function tryPlay() {
      const el = videoRef.current;
      if (!el) return;
      void el.play().catch(() => {
        /* Autoplay can still fail on strict policies; first frame / poster remains visible */
      });
    }

    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      v.addEventListener("loadeddata", tryPlay, { once: true });
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function onMotionPreference() {
      const el = videoRef.current;
      if (!el) return;
      if (mq.matches) {
        el.pause();
      } else {
        tryPlay();
      }
    }
    onMotionPreference();
    mq.addEventListener("change", onMotionPreference);
    return () => mq.removeEventListener("change", onMotionPreference);
  }, [useFallbackImage]);

  function onVideoError(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget;
    const code = el.error?.code;
    // 2 = network, 4 = format not supported / decode — show static image
    if (code === MediaError.MEDIA_ERR_NETWORK || code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      setUseFallbackImage(true);
    }
  }

  if (useFallbackImage) {
    return (
      <Image
        src={HOME_MARKETING_HERO_PATH}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.58]"
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover opacity-[0.58]"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={HOME_MARKETING_HERO_PATH}
      aria-hidden
      src={HOME_MARKETING_HERO_VIDEO_SRC}
      onError={onVideoError}
    />
  );
}
