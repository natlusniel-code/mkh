import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

/**
 * Swipeable product image gallery (change 8).
 *
 * The main image is a horizontal scroll-snap track: on touch devices you swipe
 * left/right to the next image, and on desktop the arrows / dots / keyboard
 * move between slides. The active index is derived from the scroll position so
 * swiping and the thumbnails always agree.
 */
export function SwipeGallery({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = images.length;

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(Math.max(0, Math.min(count - 1, idx)));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActive(next);
  }

  if (count === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <ProductImage src={null} alt={alt} className="aspect-square w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="group relative overflow-hidden rounded-2xl border bg-card">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mh-scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          style={{ touchAction: "pan-y pinch-zoom" }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goTo(active + 1);
            if (e.key === "ArrowLeft") goTo(active - 1);
          }}
          aria-label={`${alt} — image ${active + 1} of ${count}`}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full shrink-0 snap-center">
              <ProductImage src={src} alt={`${alt} — view ${i + 1}`} className="aspect-square w-full" />
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm transition-opacity hover:bg-background disabled:opacity-0 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === count - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm transition-opacity hover:bg-background disabled:opacity-0 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full bg-foreground/30 transition-all",
                    i === active ? "w-5 bg-primary" : "w-1.5",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto mh-scrollbar-none">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted",
                i === active ? "border-primary" : "border-transparent",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
