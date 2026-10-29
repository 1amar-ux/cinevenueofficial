import React, { useState, useEffect } from "react";
import { Sparkles, ChevronRight, ExternalLink } from "lucide-react";
import { globalSyncClient, BannerRecord } from "../../services/globalSyncClient";

export const CmsPromoBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<BannerRecord[]>(() => {
    return globalSyncClient.getState().banners.filter((b) => b.active);
  });

  useEffect(() => {
    const unsub = globalSyncClient.subscribe((state) => {
      setBanners(state.banners.filter((b) => b.active));
    });
    return () => unsub();
  }, []);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0a0c] border-b border-white/5 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-gold/10 text-gold border border-gold/20">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Featured Promotional Campaigns
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">
            {banners.length} Live {banners.length === 1 ? "Offer" : "Offers"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 p-3.5 hover:border-gold/30 transition-all group"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                    {b.type}
                  </span>
                  <h4 className="text-xs font-bold text-white group-hover:text-gold transition-colors leading-snug">
                    {b.title}
                  </h4>
                  {b.targetAudience && (
                    <span className="text-[9px] text-text-muted block">
                      Target: {b.targetAudience}
                    </span>
                  )}
                </div>
                <span className="p-1 rounded bg-white/5 text-text-secondary group-hover:text-gold group-hover:bg-gold/10 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CmsPromoBannerSlider;
