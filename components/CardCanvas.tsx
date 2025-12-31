import React, { useRef } from 'react';
import { StarIcon, StarBurstIcon, GiftIcon, BellIcon, CameraIcon } from './Icons';
import { CardState } from '../types';

interface CardCanvasProps {
  cardRef: React.RefObject<HTMLDivElement>;
  cardState: CardState;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CardCanvas: React.FC<CardCanvasProps> = ({ cardRef, cardState, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLandscape = cardState.orientation === 'landscape';

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Helper styles for dynamic colors
  const bgStyle = { backgroundColor: cardState.backgroundColor };
  const textAccentStyle = { color: cardState.accentColor };
  const bgAccentStyle = { backgroundColor: cardState.accentColor };
  const borderAccentStyle = { borderColor: cardState.accentColor };
  
  // Gradient helper
  const gradientBlobStyle = {
    background: `linear-gradient(135deg, ${cardState.accentColor}40, transparent)`
  };

  return (
    <div 
      className={`relative shadow-2xl overflow-hidden select-none text-white transition-all duration-500 ease-in-out ${
        isLandscape ? 'w-full max-w-5xl aspect-video' : 'w-full max-w-[500px] aspect-[9/16]'
      }`}
      style={bgStyle}
      ref={cardRef}
    >
      
      {/* --- Background Decorations (Bubbles & Motifs) --- */}
      
      {/* 1. Large Organic Blobs */}
      {/* Bottom Left Gold Blob */}
      <div 
        className="absolute -bottom-[15%] -left-[10%] w-[45%] h-[45%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] pointer-events-none opacity-90 transition-colors duration-300"
        style={bgAccentStyle}
      ></div>

      {/* Top Right Green/Dark Blob */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* 2. Abstract Lines & Curves (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
         {/* White curved line top left */}
         <path d="M-10 20 Q 20 40 10 70" stroke="white" strokeWidth="0.5" fill="none" />
         {/* Another curve top right */}
         <path d="M70 -10 Q 80 20 110 10" stroke="white" strokeWidth="0.5" fill="none" />
         {/* Wavy accent line bottom */}
         <path d="M0 90 Q 25 80 50 90 T 100 90" stroke={cardState.accentColor} strokeWidth="0.3" fill="none" opacity="0.5" />
      </svg>
      
      {/* 3. Hollow Pill Shapes (Bubbles) */}
      {/* Center Top-ish */}
      <div className="absolute top-[12%] left-[40%] w-16 h-6 border-2 border-white/80 rounded-full pointer-events-none transform -rotate-6"></div>
      {/* Small pill near bottom */}
      <div className="absolute bottom-[20%] right-[25%] w-8 h-3 border border-white/40 rounded-full pointer-events-none rotate-12"></div>

      {/* 4. Floating Circles/Orbs */}
      <div className="absolute top-[25%] left-[10%] w-4 h-4 rounded-full bg-white/20 pointer-events-none blur-[1px]"></div>
      <div className="absolute top-[60%] right-[10%] w-12 h-12 rounded-full border border-white/10 pointer-events-none"></div>
      <div 
         className="absolute bottom-[30%] left-[5%] w-6 h-6 rounded-full pointer-events-none opacity-60"
         style={{ backgroundColor: cardState.accentColor }}
      ></div>
      
      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>

      {/* Stars (Retained) */}
      <StarIcon className="absolute top-[18%] right-[20%] w-6 h-6 text-white animate-pulse pointer-events-none opacity-80" />
      <StarBurstIcon className="absolute bottom-[15%] left-[8%] w-8 h-8 text-white pointer-events-none opacity-60" />


      {/* --- Header Content --- */}
      <div className="absolute top-[6%] left-[5%] flex items-center gap-2 z-20">
         <div className="flex flex-col items-start justify-center">
             <div className="flex items-center gap-1">
                <StarBurstIcon className="w-5 h-5 text-white" />
                <span className="font-bebas text-xl tracking-widest leading-none">NEWYEAR</span>
             </div>
             <span className="font-bebas text-xl tracking-widest leading-none ml-6">PARTY</span>
         </div>
      </div>

      <div className="absolute top-[6%] right-[5%] flex items-center gap-3 z-20">
         <div className="bg-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center shadow-lg" style={{ color: cardState.backgroundColor }}>
            <GiftIcon className="w-4 h-4" />
         </div>
         <div className="bg-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center shadow-lg" style={{ color: cardState.backgroundColor }}>
            <BellIcon className="w-4 h-4" />
         </div>
         <span className={`font-montserrat font-semibold text-xs md:text-sm tracking-wide shadow-black drop-shadow-md ${!isLandscape && 'hidden sm:inline'}`}>Celebration</span>
      </div>


      {/* --- Main Content Area --- */}
      
      {/* 1. Image Card Section */}
      <div 
        className={`absolute z-10 flex items-center justify-center transition-all duration-500 ${
          isLandscape 
            ? 'left-[10%] top-[20%] bottom-[20%] w-[35%]' 
            : 'top-[15%] left-1/2 -translate-x-1/2 w-[65%] h-[40%]'
        }`}
      >
         <div className="relative w-full h-full transform -rotate-6 hover:scale-105 transition-transform duration-300 ease-out">
            
            {/* The Accent Color Card Background */}
            <div className="absolute inset-0 rounded-[30px] shadow-2xl" style={bgAccentStyle}></div>
            
            {/* The Image Container inside the card */}
            <div 
               className="absolute top-3 left-3 right-3 bottom-3 rounded-[24px] overflow-hidden cursor-pointer group flex items-center justify-center"
               style={bgStyle}
               onClick={handleUploadClick}
            >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={onImageUpload}
                  accept="image/*"
                  className="hidden" 
                />
                
                {cardState.image ? (
                  <img 
                    src={cardState.image} 
                    alt="Uploaded" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-80 p-4 text-center" style={textAccentStyle}>
                      <CameraIcon className="w-12 h-12 mb-2" />
                      <span className="font-montserrat font-bold text-sm uppercase">Upload Photo</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white text-xs font-bold uppercase tracking-wider border border-white px-3 py-1 rounded-full">Change</span>
                </div>
            </div>

            {/* Decorative white outline behind/around card */}
            <div className="absolute -inset-4 border-2 border-white/20 rounded-[40px] -z-10 pointer-events-none"></div>
         </div>
      </div>

      {/* 2. Typography Section */}
      <div 
        className={`absolute z-20 flex flex-col transition-all duration-500 ${
          isLandscape 
            ? 'right-[8%] top-[50%] -translate-y-1/2 w-[50%] items-end text-right' 
            : 'top-[57%] left-1/2 -translate-x-1/2 w-[90%] items-center text-center'
        }`}
      >
          <h1 
            className="font-bebas leading-[0.85] drop-shadow-xl"
            style={{ 
              color: cardState.accentColor,
              fontSize: isLandscape ? 'clamp(60px,10vw,140px)' : 'clamp(50px, 12vw, 90px)'
            }}
          >
            HAPPY<br/>NEW YEAR
          </h1>
          
          <p 
            className="font-montserrat text-white tracking-[0.2em] font-light mt-4 drop-shadow-md"
            style={{
              fontSize: isLandscape ? 'clamp(16px,2vw,30px)' : 'clamp(12px, 3.5vw, 18px)'
            }}
          >
             {cardState.year}
          </p>

          {/* Custom Wish/Message */}
          {cardState.message && (
             <p 
               className="font-montserrat text-white/90 italic font-light mt-3 max-w-md mx-auto leading-relaxed drop-shadow-md"
               style={{
                  fontSize: isLandscape ? 'clamp(10px,1.2vw,16px)' : 'clamp(10px, 3vw, 14px)'
               }}
             >
               "{cardState.message}"
             </p>
          )}
      </div>


      {/* --- Footer Content --- */}
      <div className={`absolute left-[5%] z-20 ${isLandscape ? 'bottom-[6%]' : 'bottom-[4%]'}`}>
         <span className="font-montserrat font-bold text-sm md:text-base tracking-wider opacity-90 uppercase drop-shadow-md">Best wishes for the new year</span>
      </div>

      <div className={`absolute right-[5%] flex items-center gap-3 z-20 ${isLandscape ? 'bottom-[6%]' : 'bottom-[4%]'}`}>
         {/* Ring decoration */}
         <div className="w-3 h-3 md:w-4 md:h-4 border-2 rounded-full" style={borderAccentStyle}></div>
         {/* Solid dot */}
         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full absolute -left-6 -top-4 -z-10 opacity-80" style={bgAccentStyle}></div>
         
         <GiftIcon className="w-6 h-6 md:w-8 md:h-8 mb-1" style={textAccentStyle} />
         
         <span className="font-bebas text-3xl md:text-5xl tracking-wide drop-shadow-lg" style={textAccentStyle}>{cardState.date}</span>
      </div>

    </div>
  );
};

export default CardCanvas;
