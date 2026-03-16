import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  Instagram, 
  MessageSquare, 
  Lightbulb, 
  ShoppingBag,
  RefreshCw,
  ChevronRight,
  Download,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeJersey, generateProfessionalImage, JerseyAnalysis } from './services/geminiService';
import { cn } from './lib/utils';
import InteractiveWaveShader from './components/ui/flowing-waves-shader';
import FlashyLoader from './components/ui/flashy-loader';

const THEME = {
  bg: 'bg-[#050510]',
  card: 'bg-[#0A0A1F]',
  accent: 'text-[#FF6B00]',
  accentBg: 'bg-[#FF6B00]',
  border: 'border-white/10',
  textMuted: 'text-zinc-400',
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [analysis, setAnalysis] = useState<JerseyAnalysis | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [userSpecs, setUserSpecs] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      // Reset previous results
      setAnalysis(null);
      setGeneratedImageUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setAnalysis(null);
      setGeneratedImageUrl(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeJersey(base64, file.type, userSpecs);
      setAnalysis(result);
      
      // Automatically generate professional image after analysis
      if (result.imagePrompt) {
        await handleGenerateImage(result.imagePrompt);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (overridePrompt?: string) => {
    const prompt = overridePrompt || analysis?.imagePrompt;
    if (!prompt) return;

    // Check for API key selection for image generation models
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceeding after opening dialog as per instructions (assume success)
      }
    }

    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateProfessionalImage(prompt);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error("Image generation failed:", error);
      // If error suggests key issues, prompt again
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `jersey-guys-${analysis?.detectedJersey?.toLowerCase().replace(/\s+/g, '-') || 'professional'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={cn("min-h-screen text-white font-sans selection:bg-[#FF6B00] selection:text-black", THEME.bg)}>
      <InteractiveWaveShader />
      {/* Header */}
      <header className="border-b border-white/5 py-6 px-8 flex justify-between items-center sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase italic">The Jersey Guys</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">Content Engine v1.0</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-zinc-400">
          <span className="hover:text-[#FF6B00] cursor-pointer transition-colors">Analyzer</span>
          <span className="hover:text-[#FF6B00] cursor-pointer transition-colors">Generator</span>
          <span className="hover:text-[#FF6B00] cursor-pointer transition-colors">Archive</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Upload & Input */}
        <div className="lg:col-span-5 space-y-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FF6B00]" />
              01. Upload Jersey
            </h2>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "relative aspect-[4/5] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden group",
                previewUrl ? "border-transparent" : "border-white/10 hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5"
              )}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Change Photo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-zinc-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">Drop your jersey photo here</p>
                    <p className="text-zinc-500 text-sm mt-1">or click to browse files</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Select File
                  </button>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[#FF6B00]" />
              02. Specifications
            </h2>
            <textarea
              placeholder="Add specific details (Price, Sizes, Sale info, Player name, Tone preference...)"
              value={userSpecs}
              onChange={(e) => setUserSpecs(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF6B00] transition-colors resize-none placeholder:text-zinc-600"
            />
            <button
              disabled={!file || isAnalyzing}
              onClick={handleAnalyze}
              className={cn(
                "w-full mt-4 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all",
                !file || isAnalyzing 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-[#FF6B00] text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,107,0,0.3)]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Jersey...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-12">
          <AnimatePresence mode="wait">
            {!analysis && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border border-white/5 rounded-3xl bg-white/[0.02]"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to create?</h3>
                <p className="text-zinc-500 max-w-xs">Upload a photo and we'll generate professional content for your social media.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <FlashyLoader message="ANALYZING JERSEY" type="analyze" />
              </motion.div>
            )}

            {analysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Detection Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold uppercase tracking-widest rounded">Detected</span>
                    </div>
                    <h2 className="text-3xl font-black italic uppercase leading-none">{analysis.detectedJersey}</h2>
                  </div>
                </div>

                {/* Step 2: Image Prompt */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#FF6B00]" />
                      01. AI Image Prompt
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(analysis.imagePrompt, 'prompt')}
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'prompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'prompt' ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-mono text-xs leading-relaxed text-zinc-300">
                    {analysis.imagePrompt}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button
                      disabled={isGeneratingImage}
                      onClick={() => handleGenerateImage()}
                      className={cn(
                        "py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
                        isGeneratingImage 
                          ? "bg-zinc-800 text-zinc-500" 
                          : "bg-white text-black hover:bg-[#FF6B00] hover:text-black"
                      )}
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating Professional Visual...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Professional Visual
                        </>
                      )}
                    </button>

                    {isGeneratingImage && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
                      >
                        <FlashyLoader message="GENERATING VISUAL" type="generate" />
                      </motion.div>
                    )}

                    {generatedImageUrl && !isGeneratingImage && (
                      <div className="space-y-4">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-[#FF6B00]/30 shadow-[0_0_50px_rgba(255,107,0,0.1)]"
                        >
                          <img src={generatedImageUrl} alt="Generated Professional" className="w-full h-full object-cover" />
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                            AI Enhanced
                          </div>
                        </motion.div>
                        <button
                          onClick={downloadImage}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all"
                        >
                          <Download className="w-4 h-4" />
                          Download Professional Image
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 3: Social Media Post */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-[#FF6B00]" />
                    02. Social Media Post
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Caption */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Instagram Caption</span>
                        <button 
                          onClick={() => copyToClipboard(analysis.socialMediaPost.caption, 'caption')}
                          className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {copiedField === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed">{analysis.socialMediaPost.caption}</p>
                      
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Hashtags</span>
                          <button 
                            onClick={() => copyToClipboard(analysis.socialMediaPost.hashtags, 'hashtags')}
                            className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {copiedField === 'hashtags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-[#FF6B00] font-medium leading-relaxed">{analysis.socialMediaPost.hashtags}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Story Caption */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Story / Reel Overlay</span>
                        <p className="text-sm font-bold italic">"{analysis.socialMediaPost.storyCaption}"</p>
                      </div>
                      
                      {/* Format & Tags */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Suggested Format</span>
                        <p className="text-xs font-medium">{analysis.socialMediaPost.postFormat}</p>
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tag: </span>
                          <span className="text-[10px] text-zinc-500">{analysis.socialMediaPost.tagSuggestions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 4: Bonus Content */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                    03. Bonus Content
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Listing */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Listing</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{analysis.bonusContent.productListing}</p>
                      <button 
                        onClick={() => copyToClipboard(analysis.bonusContent.productListing, 'listing')}
                        className="w-full py-2 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        {copiedField === 'listing' ? 'Copied!' : 'Copy Listing'}
                      </button>
                    </div>

                    {/* Content Ideas */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Content Ideas</span>
                      </div>
                      <ul className="space-y-3">
                        {analysis.bonusContent.contentIdeas.map((idea, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex gap-2">
                            <span className="text-[#FF6B00] font-bold">0{i+1}.</span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="text-black w-5 h-5" />
            </div>
            <h1 className="text-sm font-bold tracking-tight uppercase italic">The Jersey Guys</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Built for Agastya, Arhaan, Yuvaan, Shaurya & Shivaan
          </p>
          <div className="flex gap-6">
            <Instagram className="w-4 h-4 text-zinc-600 hover:text-white cursor-pointer" />
            <MessageSquare className="w-4 h-4 text-zinc-600 hover:text-white cursor-pointer" />
            <Share2 className="w-4 h-4 text-zinc-600 hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
