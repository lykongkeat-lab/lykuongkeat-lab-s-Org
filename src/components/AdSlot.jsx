import React, { useEffect, useState, useRef } from 'react';
import { getActiveAdsBySlot, recordAdImpression, recordAdClick } from '../lib/api';

export default function AdSlot({ slot, className = '' }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const scriptContainerRef = useRef(null);
  const impressionRecorded = useRef(new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadAds() {
      try {
        const data = await getActiveAdsBySlot(slot);
        if (isMounted) {
          setAds(data || []);
        }
      } catch (err) {
        console.error(`Error loading ads for slot ${slot}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAds();

    return () => {
      isMounted = false;
    };
  }, [slot]);

  // Record impressions and inject script ads when ads are loaded
  useEffect(() => {
    if (!ads || ads.length === 0) return;

    ads.forEach((ad) => {
      if (!impressionRecorded.current.has(ad.id)) {
        impressionRecorded.current.add(ad.id);
        recordAdImpression(ad.id);
      }

      // If ad is script type, execute scripts properly
      if (ad.ad_type === 'script' && ad.script_code && scriptContainerRef.current) {
        const container = scriptContainerRef.current;
        container.innerHTML = ''; // Clear previous

        const wrapper = document.createElement('div');
        wrapper.innerHTML = ad.script_code;

        // innerHTML does not execute <script> tags, so create elements manually
        const scripts = wrapper.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        container.appendChild(wrapper);
      }
    });
  }, [ads]);

  if (loading || !ads || ads.length === 0) {
    return null; // Don't render empty ad boxes if no active ad
  }

  return (
    <div className={`my-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50/50 p-2 text-center dark:border-neutral-800 dark:bg-neutral-900/40 ${className}`}>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Advertisement
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        {ads.map((ad) => {
          if (ad.ad_type === 'image' && ad.image_url) {
            return (
              <a
                key={ad.id}
                href={ad.link_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordAdClick(ad.id)}
                className="group block transition-opacity hover:opacity-95"
              >
                <img
                  src={ad.image_url}
                  alt={ad.name || 'Advertisement'}
                  style={{
                    maxWidth: ad.width ? `${ad.width}px` : '100%',
                    maxHeight: ad.height ? `${ad.height}px` : 'auto',
                  }}
                  className="mx-auto rounded object-contain shadow-xs transition-transform group-hover:scale-[1.01]"
                />
              </a>
            );
          }

          if (ad.ad_type === 'script') {
            return (
              <div
                key={ad.id}
                ref={scriptContainerRef}
                className="w-full flex justify-center items-center overflow-x-auto"
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
