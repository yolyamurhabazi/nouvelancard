import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, AlertCircle, Smartphone, Monitor, RotateCcw } from 'lucide-react';
import CardCanvas from './components/CardCanvas';
import { CardState } from './types';

function App() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store the processed CSS with base64 fonts to pass to html-to-image
  const fontCssRef = useRef<string>('');

  const defaultState: CardState = {
    image: null,
    year: '2025',
    date: '31.12.2024',
    backgroundColor: '#132A13',
    accentColor: '#FDB813',
    orientation: 'landscape'
  };

  const [cardState, setCardState] = useState<CardState>(defaultState);

  // Robust Font Loading: Fetch fonts and convert to Base64 to avoid CORS issues in html-to-image
  useEffect(() => {
    const embedFonts = async () => {
      try {
        // 1. Fetch the CSS from Google Fonts
        const url = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&display=swap';
        const cssResponse = await fetch(url);
        let cssText = await cssResponse.text();

        // 2. Find all font URLs in the CSS
        const fontUrlMatches = cssText.match(/url\((https:\/\/[^)]+)\)/g) || [];
        const uniqueFontUrls = new Set(
          fontUrlMatches.map(match => match.replace(/url\(|['"]|\)/g, ''))
        );

        // 3. Fetch each font file and convert to Base64
        for (const fontUrl of uniqueFontUrls) {
          try {
            const fontResponse = await fetch(fontUrl);
            const blob = await fontResponse.blob();
            
            // Convert blob to base64
            const reader = new FileReader();
            const base64Data = await new Promise<string>((resolve) => {
               reader.onloadend = () => resolve(reader.result as string);
               reader.readAsDataURL(blob);
            });

            // Replace the URL in the CSS with the Data URI
            // using split/join as a polyfill for replaceAll
            cssText = cssText.split(fontUrl).join(base64Data);
          } catch (fontErr) {
            console.warn('Could not embed font:', fontUrl);
          }
        }

        // 4. Inject the self-contained CSS into the head for live display
        const style = document.createElement('style');
        style.innerHTML = cssText;
        document.head.appendChild(style);

        // 5. Save it for the image generator
        fontCssRef.current = cssText;

      } catch (e) {
        console.error("Font embedding failed", e);
        // Fallback for live display
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    };

    embedFonts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCardState(prev => ({ ...prev, image: imageUrl }));
      setError(null);
    }
  };

  const downloadCard = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    setLoading(true);
    setError(null);

    // Helper to trigger download
    const triggerDownload = (dataUrl: string) => {
      const link = document.createElement('a');
      link.download = `happy-new-year-${cardState.year}-card.png`;
      link.href = dataUrl;
      link.click();
    };

    try {
      // Small delay to ensure rendering is stable
      await new Promise(resolve => setTimeout(resolve, 100));

      // Attempt 1: Full quality with embedded fonts
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: false, // Disabled to prevent blob URL issues
        pixelRatio: 2,
        skipAutoScale: true,
        fontEmbedCSS: fontCssRef.current || undefined, // Use our pre-fetched CSS
        filter: (node) => node.tagName !== 'LINK', // Ignore external links
      });
      
      triggerDownload(dataUrl);

    } catch (err) {
      console.warn("First download attempt failed. Retrying with fallback configuration...", err);
      
      try {
        // Attempt 2: Simplified (no custom font embedding in the generator options)
        // This relies on the browser's current render state
        const dataUrl = await toPng(cardRef.current, { 
          cacheBust: false,
          pixelRatio: 1, // Lower resolution might help if memory is an issue
          skipAutoScale: true,
          fontEmbedCSS: '', // Disable font embedding
          filter: (node) => node.tagName !== 'LINK',
        });
        
        triggerDownload(dataUrl);
      } catch (retryErr) {
         console.error(retryErr);
         setError("Could not generate image. Please try a different browser or device.");
      }
    } finally {
      setLoading(false);
    }
  }, [cardState]);

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Happy New Year Card',
          text: 'Check out my New Year card!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const resetStyles = () => {
    setCardState(prev => ({
        ...prev,
        backgroundColor: defaultState.backgroundColor,
        accentColor: defaultState.accentColor,
        orientation: defaultState.orientation
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f0d] flex flex-col items-center py-6 px-4 font-montserrat overflow-x-hidden">
      
      {/* Header & Controls */}
      <div className="w-full max-w-5xl mb-6 text-center z-50">
         <h1 className="font-bebas text-4xl md:text-5xl text-[#FDB813] mb-2 tracking-wide drop-shadow-lg">New Year Card Generator</h1>
         
         {/* Customization Controls */}
         <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-wrap justify-center gap-6 items-center mx-auto w-fit">
            
            {/* Color Controls */}
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-center gap-1">
                  <label htmlFor="bg-color" className="text-xs text-gray-400 uppercase font-bold tracking-wider">Background</label>
                  <div className="relative overflow-hidden w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <input 
                        id="bg-color"
                        type="color" 
                        value={cardState.backgroundColor}
                        onChange={(e) => setCardState(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 cursor-pointer border-0"
                    />
                  </div>
               </div>

               <div className="flex flex-col items-center gap-1">
                  <label htmlFor="accent-color" className="text-xs text-gray-400 uppercase font-bold tracking-wider">Text / Accent</label>
                  <div className="relative overflow-hidden w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <input 
                        id="accent-color"
                        type="color" 
                        value={cardState.accentColor}
                        onChange={(e) => setCardState(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 cursor-pointer border-0"
                    />
                  </div>
               </div>
            </div>

            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

            {/* Orientation Toggle */}
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                <button 
                   onClick={() => setCardState(prev => ({ ...prev, orientation: 'landscape' }))}
                   className={`p-2 rounded-md transition-all ${cardState.orientation === 'landscape' ? 'bg-[#FDB813] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                   title="Landscape"
                >
                    <Monitor size={20} />
                </button>
                <button 
                   onClick={() => setCardState(prev => ({ ...prev, orientation: 'portrait' }))}
                   className={`p-2 rounded-md transition-all ${cardState.orientation === 'portrait' ? 'bg-[#FDB813] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                   title="Portrait"
                >
                    <Smartphone size={20} />
                </button>
            </div>

            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

            <button 
                onClick={resetStyles}
                className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 p-2 rounded transition-colors"
            >
                <RotateCcw size={16} />
                Reset
            </button>

         </div>

         {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
         )}
      </div>

      {/* Main Canvas Area */}
      <div className="w-full flex justify-center mb-24 relative z-10 transition-all">
        <CardCanvas 
          cardRef={cardRef} 
          cardState={cardState} 
          onImageUpload={handleImageUpload} 
        />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t p-4 flex justify-center gap-12 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{ 
            backgroundColor: `${cardState.backgroundColor}F2`, // 95% opacity hex
            borderColor: `${cardState.accentColor}33` // 20% opacity hex
        }}
      >
        <button 
          onClick={downloadCard}
          disabled={loading}
          className="group flex flex-col items-center gap-2 text-white hover:opacity-100 transition-all duration-300 disabled:opacity-50"
          style={{ '--hover-color': cardState.accentColor } as React.CSSProperties}
        >
          <div 
            className="bg-white/5 p-3 rounded-2xl transition-all ring-1 ring-white/10 group-hover:text-black group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            style={{ 
               // Just relying on standard styles for simplicity to match previous aesthetic
            }}
          >
             {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
                <Download size={24} />
             )}
          </div>
          <span className="font-bebas text-lg tracking-widest">Download</span>
        </button>

        <button 
          onClick={shareCard}
          className="group flex flex-col items-center gap-2 text-white transition-all duration-300"
        >
          <div className="bg-white/5 p-3 rounded-2xl ring-1 ring-white/10">
            <Share2 size={24} />
          </div>
          <span className="font-bebas text-lg tracking-widest">Share</span>
        </button>
      </div>

    </div>
  );
}

export default App;