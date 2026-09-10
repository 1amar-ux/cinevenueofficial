import React, { useState, useEffect } from "react";
import { ExternalLink, Sparkles, Clock, AlertCircle } from "lucide-react";
import { BannerPlacementId } from "../../types/advertising";
import { fetchActiveLiveBanner, trackLiveBannerEvent } from "../../services/advertisingService";

interface CineVenueLiveBannerProps {
  placement: BannerPlacementId;
  className?: string;
  showCountdown?: boolean;
}

export const CineVenueLiveBanner: React.FC<CineVenueLiveBannerProps> = ({
  placement,
  className = "",
  showCountdown = true
}) => {
  const [bannerData, setBannerData] = useState<{
    hasDirectAd: boolean;
    banner?: {
      id: string;
      campaignNumber: string;
      businessName: string;
      adTitle: string;
      shortDescription?: string;
      destinationUrl: string;
      desktopImageUrl: string;
      mobileImageUrl: string;
      altText: string;
      startAtUtc: string;
      endAtUtc: string;
      remainingSeconds: number;
    };
    supportsGoogleAdSenseFallback: boolean;
  } | null>(null);

  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadBanner = async () => {
      try {
        const res = await fetchActiveLiveBanner(placement);
        if (mounted && res) {
          setBannerData(res);
          if (res.banner?.remainingSeconds) {
            setRemainingSec(res.banner.remainingSeconds);
          }
        }
      } catch (err) {
        console.warn("[LiveBanner] Error loading banner:", err);
      }
    };

    loadBanner();
    const interval = setInterval(loadBanner, 60000); // Poll for live campaign status updates
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [placement]);

  // Visual countdown timer
  useEffect(() => {
    if (remainingSec <= 0) return;
    const timer = setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSec]);

  // Track impression once per banner mount
  useEffect(() => {
    if (bannerData?.banner?.id && !hasTrackedImpression) {
      trackLiveBannerEvent(bannerData.banner.id, "impression");
      setHasTrackedImpression(true);
    }
  }, [bannerData?.banner?.id, hasTrackedImpression]);

  const handleBannerClick = () => {
    if (!bannerData?.banner) return;
    trackLiveBannerEvent(bannerData.banner.id, "click");
    if (bannerData.banner.destinationUrl) {
      window.open(bannerData.banner.destinationUrl, "_blank", "noopener,noreferrer");
    }
  };

  const formatRemainingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // -------------------------------------------------------------
  // PRIORITY 1: Paid CineVenue Direct Live Banner
  // -------------------------------------------------------------
  if (bannerData?.hasDirectAd && bannerData.banner) {
    const { banner } = bannerData;

    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-gold/30 bg-[#0C0D12] shadow-2xl transition-all hover:border-gold/60 cursor-pointer group ${className}`}
        onClick={handleBannerClick}
        role="region"
        aria-label={`Sponsored Advertisement: ${banner.adTitle}`}
      >
        {/* Banner Badges Header */}
        <div className="absolute top-2.5 left-3 z-20 flex items-center gap-2 select-none">
          <span className="flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-gold border border-gold/40 backdrop-blur-md">
            <Sparkles className="w-2.5 h-2.5 text-gold" />
            Sponsored
          </span>
          {showCountdown && remainingSec > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-mono text-white/90 border border-white/20 backdrop-blur-md">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              Live for {formatRemainingTime(remainingSec)}
            </span>
          )}
        </div>

        {/* External link indicator */}
        <div className="absolute top-2.5 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity select-none">
          <span className="flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-bold text-white/80 border border-white/20 backdrop-blur-md">
            <span>Visit Sponsor</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Responsive Creatives: Desktop & Mobile */}
        <div className="relative w-full">
          {/* Desktop Image */}
          <img
            src={banner.desktopImageUrl}
            alt={banner.altText || banner.adTitle}
            className="hidden md:block w-full h-auto object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
          />
          {/* Mobile Image */}
          <img
            src={banner.mobileImageUrl || banner.desktopImageUrl}
            alt={banner.altText || banner.adTitle}
            className="block md:hidden w-full h-auto object-cover max-h-[220px]"
            loading="lazy"
          />
        </div>

        {/* Subtle Bottom Information Strip */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-black/95 via-[#12131A]/90 to-black/95 flex items-center justify-between border-t border-white/5 text-left">
          <div className="truncate pr-2">
            <span className="text-[11px] font-bold text-white group-hover:text-gold transition-colors">
              {banner.businessName}
            </span>
            {banner.shortDescription && (
              <span className="text-[10px] text-text-muted ml-2 truncate hidden sm:inline">
                — {banner.shortDescription}
              </span>
            )}
          </div>
          <span className="text-[9px] font-mono text-gold/70 shrink-0 uppercase tracking-wider">
            Verified Partner
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIORITY 2: Google AdSense Fallback (if configured)
  // -------------------------------------------------------------
  if (bannerData?.supportsGoogleAdSenseFallback) {
    const isAdSenseEnabled = (typeof window !== "undefined" && (window as any).__VITE_ENV__?.VITE_ADSENSE_ENABLED === "true") || false;
    const publisherId = (typeof window !== "undefined" && (window as any).__VITE_ENV__?.VITE_ADSENSE_PUBLISHER_ID) || "";

    if (isAdSenseEnabled && publisherId) {
      return (
        <div className={`w-full overflow-hidden rounded-xl border border-white/10 bg-[#0B0C10] p-2 text-center text-xs text-text-muted ${className}`}>
          <div className="text-[9px] uppercase tracking-widest text-text-muted/60 mb-1">Advertisement</div>
          <div className="min-h-[90px] flex items-center justify-center bg-white/[0.02] rounded border border-dashed border-white/10">
            {/* Google AdSense tag placeholder */}
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={publisherId}
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      );
    }
  }

  // -------------------------------------------------------------
  // PRIORITY 3: Clean Collapse (No ad shown, zero layout clutter)
  // -------------------------------------------------------------
  return null;
};

export default CineVenueLiveBanner;
