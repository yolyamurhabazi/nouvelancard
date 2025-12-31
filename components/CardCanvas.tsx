import React, { useRef } from 'react';
import { StarIcon, StarBurstIcon, FacebookIcon, InstagramIcon, CameraIcon } from './Icons';
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
    background: `linear-gradient(to bottom, ${cardState.accentColor}, transparent)`
  };

  return (
    <div 
      className={`relative shadow-2xl overflow-hidden select-none text-white transition-all duration-500 ease-in-out ${
        isLandscape ? 'w-full max-w-5xl aspect-video' : 'w-full max-w-[500px] aspect-[9/16]'
      }`}
      style={bgStyle}
      ref={cardRef}
    >
      
      {/* --- Background Decorations --- */}
      
      {/* Top Right Blob */}
      <div 
        className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] opacity-20 rounded-bl-[100%] transform rotate-12 pointer-events-none"
        style={gradientBlobStyle}
      ></div>
      
      {/* Bottom Left Blob (Darker shade of main bg usually, here kept fixed or slightly adjusted) */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[60%] bg-black/20 rounded-tr-[100%] pointer-events-none"></div>
      
      {/* Geometric Lines/Shapes */}
      <svg className="absolute top-[10%] left-[25%] w-[30%] h-[30%] opacity-30 pointer-events-none" viewBox="0 0 200 200" fill="none">
         <path d="M20,100 Q60,20 180,60" stroke="white" strokeWidth="1" />
         <path d="M180,60 Q190,80 170,150" stroke="white" strokeWidth="1" />
         <path d="M170,150 Q120,190 20,150" stroke="white" strokeWidth="1" />
      </svg>
      
      {/* Circle Outline Decorations */}
      <div className="absolute top-[15%] left-[45%] w-16 h-8 border-2 border-white/20 rounded-full transform -rotate-12 pointer-events-none"></div>
      <div className="absolute bottom-[25%] left-[55%] w-12 h-6 border-2 border-white/20 rounded-full transform -rotate-12 pointer-events-none"></div>
      <div className="absolute top-[50%] right-[45%] w-4 h-4 border border-white/30 rounded-full pointer-events-none"></div>

      {/* Stars */}
      <StarIcon className="absolute top-[25%] right-[35%] w-8 h-8 text-white animate-pulse pointer-events-none" />
      <StarBurstIcon className="absolute bottom-[20%] left-[5%] w-10 h-10 text-white pointer-events-none" />
      <StarIcon className="absolute top-[8%] left-[5%] w-4 h-4 text-white opacity-50 pointer-events-none" />


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
         <div className="bg-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center" style={{ color: cardState.backgroundColor }}>
            <FacebookIcon className="w-4 h-4" />
         </div>
         <div className="bg-white rounded-full p-1.5 w-7 h-7 flex items-center justify-center" style={{ color: cardState.backgroundColor }}>
            <InstagramIcon className="w-4 h-4" />
         </div>
         <span className={`font-montserrat font-semibold text-xs md:text-sm tracking-wide ${!isLandscape && 'hidden sm:inline'}`}>newyearparty.official</span>
      </div>


      {/* --- Main Content Area --- */}
      
      {/* 1. Image Card Section */}
      <div 
        className={`absolute z-10 flex items-center justify-center transition-all duration-500 ${
          isLandscape 
            ? 'left-[10%] top-[20%] bottom-[20%] w-[35%]' 
            : 'top-[18%] left-1/2 -translate-x-1/2 w-[65%] h-[40%]'
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
            : 'bottom-[18%] left-1/2 -translate-x-1/2 w-[90%] items-center text-center'
        }`}
      >
          <h1 
            className="font-bebas leading-[0.85] drop-shadow-lg"
            style={{ 
              color: cardState.accentColor,
              fontSize: isLandscape ? 'clamp(60px,10vw,140px)' : 'clamp(60px, 15vw, 100px)'
            }}
          >
            HAPPY<br/>NEW YEAR
          </h1>
          <p 
            className="font-montserrat text-white tracking-[0.2em] font-light mt-4"
            style={{
              fontSize: isLandscape ? 'clamp(16px,2vw,30px)' : 'clamp(14px, 4vw, 20px)'
            }}
          >
            {cardState.year} NEW YEAR PARTY
          </p>
      </div>


      {/* --- Footer Content --- */}
      <div className={`absolute left-[5%] z-20 ${isLandscape ? 'bottom-[6%]' : 'bottom-[4%]'}`}>
         <span className="font-montserrat font-bold text-sm md:text-base tracking-wider opacity-90">www.new-yearpar.ty</span>
      </div>

      <div className={`absolute right-[5%] flex items-center gap-3 z-20 ${isLandscape ? 'bottom-[6%]' : 'bottom-[4%]'}`}>
         {/* Ring decoration */}
         <div className="w-3 h-3 md:w-4 md:h-4 border-2 rounded-full" style={borderAccentStyle}></div>
         {/* Solid dot */}
         <div className="w-8 h-8 md:w-10 md:h-10 rounded-full absolute -left-6 -top-4 -z-10 opacity-80" style={bgAccentStyle}></div>
         
         <span className="font-bebas text-3xl md:text-5xl tracking-wide" style={textAccentStyle}>{cardState.date}</span>
      </div>

    </div>
  );
};

export default CardCanvas;