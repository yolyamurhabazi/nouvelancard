import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, AlertCircle, Smartphone, Monitor, RotateCcw, X, Link as LinkIcon, Mail, MessageSquareQuote } from 'lucide-react';
import CardCanvas from './components/CardCanvas';
import { CardState } from './types';

// Simple Icons for Social Media to ensure they look correct without external deps
const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

function App() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Store the processed CSS with base64 fonts to pass to html-to-image
  const fontCssRef = useRef<string>('');

  const defaultState: CardState = {
    image: null,
    year: '2026',
    date: '2026',
    message: 'Que cette année vous apporte joie et prospérité',
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
        const url = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;700&display=swap';
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
        link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;700&display=swap';
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

  // Fallback copy mechanism using a temporary textarea
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert("Lien copié ! / Link copied!");
      } else {
         throw new Error('Copy command failed');
      }
    } catch (err) {
      alert("Impossible de copier automatiquement. Veuillez copier le lien manuellement depuis la barre d'adresse.");
    }

    document.body.removeChild(textArea);
  };

  const copyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => alert("Lien copié ! / Link copied!"))
        .catch(() => fallbackCopyTextToClipboard(url));
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const getShareUrl = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Créez votre propre carte de vœux ici ! / Create your own card here!");
    
    switch(platform) {
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}%20${url}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      case 'email':
        return `mailto:?subject=Happy New Year Card&body=${text}%20${url}`;
      default:
        return '#';
    }
  };

  const resetStyles = () => {
    setCardState(prev => ({
        ...prev,
        backgroundColor: defaultState.backgroundColor,
        accentColor: defaultState.accentColor,
        orientation: defaultState.orientation,
        date: defaultState.date,
        message: defaultState.message
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f0d] flex flex-col items-center py-6 px-4 font-montserrat overflow-x-hidden">
      
      {/* Header & Controls */}
      <div className="w-full max-w-5xl mb-6 text-center z-50">
         <h1 className="font-bebas text-4xl md:text-5xl text-[#FDB813] mb-2 tracking-wide drop-shadow-lg">New Year Card Generator {cardState.year}</h1>
         
         {/* Customization Controls */}
         <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-wrap justify-center gap-6 items-center mx-auto w-fit">
            
            {/* Color Controls */}
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-center gap-1">
                  <label htmlFor="bg-color" className="text-xs text-gray-400 uppercase font-bold tracking-wider">Bg</label>
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
                  <label htmlFor="accent-color" className="text-xs text-gray-400 uppercase font-bold tracking-wider">Text</label>
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
            
            {/* Date Input */}
             <div className="flex flex-col items-center gap-1">
                <label htmlFor="card-date" className="text-xs text-gray-400 uppercase font-bold tracking-wider">Date</label>
                <input 
                    id="card-date"
                    type="text" 
                    value={cardState.date}
                    onChange={(e) => setCardState(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-black/40 border border-white/20 rounded-lg px-2 py-2 text-white text-sm font-bebas tracking-wide w-24 text-center focus:outline-none focus:border-[#FDB813] transition-colors"
                />
             </div>

            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

            {/* Message Input */}
             <div className="flex flex-col items-center gap-1">
                <label htmlFor="card-message" className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <MessageSquareQuote size={10} /> Voeux
                </label>
                <input 
                    id="card-message"
                    type="text" 
                    value={cardState.message}
                    onChange={(e) => setCardState(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Vos vœux..."
                    className="bg-black/40 border border-white/20 rounded-lg px-2 py-2 text-white text-sm tracking-wide w-32 md:w-48 text-left focus:outline-none focus:border-[#FDB813] transition-colors overflow-hidden text-ellipsis"
                />
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
        className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-4 py-2 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        style={{ 
            backgroundColor: `${cardState.backgroundColor}F2`, // 95% opacity hex
            borderColor: `${cardState.accentColor}33` // 20% opacity hex
        }}
      >
        <div className="flex items-center gap-3">
            <button 
              onClick={downloadCard}
              disabled={loading}
              className="group flex items-center gap-2 text-white hover:opacity-100 transition-all duration-300 disabled:opacity-50"
              title="Download"
            >
              <div 
                className="bg-white/5 p-2 rounded-xl transition-all ring-1 ring-white/10 group-hover:text-black group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                 {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                    <Download size={18} />
                 )}
              </div>
            </button>

            <button 
              onClick={handleShareClick}
              className="group flex items-center gap-2 text-white transition-all duration-300"
              title="Share"
            >
              <div className="bg-white/5 p-2 rounded-xl ring-1 ring-white/10 group-hover:bg-white/20">
                <Share2 size={18} />
              </div>
            </button>
        </div>

        {/* Signature */}
        <div className="text-[10px] text-white italic opacity-70 text-right font-montserrat leading-tight max-w-[60%]">
           Tout droit reserver a<br/>yolya murhabazi aubin julien
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            <h3 className="font-bebas text-2xl text-white mb-6 text-center tracking-wide">Share / Partager</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
                <a href={getShareUrl('whatsapp')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#25D366]/20 group-hover:border-[#25D366] transition-all">
                        <WhatsAppIcon size={28} />
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold group-hover:text-[#25D366]">WhatsApp</span>
                </a>

                <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#1877F2]/20 group-hover:border-[#1877F2] transition-all">
                        <FacebookIcon size={28} />
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold group-hover:text-[#1877F2]">Facebook</span>
                </a>

                <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/20 group-hover:border-white transition-all">
                        <XIcon size={24} />
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold group-hover:text-white">Twitter</span>
                </a>

                 <a href={getShareUrl('email')} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-yellow-500/20 group-hover:border-yellow-500 transition-all">
                        <Mail size={24} className="text-gray-200 group-hover:text-yellow-500" />
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold group-hover:text-yellow-500">Email</span>
                </a>
            </div>

            <div className="relative">
                <input 
                    type="text" 
                    readOnly 
                    value={window.location.href} 
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 pr-12 text-gray-300 text-sm focus:outline-none"
                />
                <button 
                    onClick={copyLink}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                    title="Copy Link"
                >
                    <LinkIcon size={18} />
                </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Partagez ce lien pour inviter vos amis !</p>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;