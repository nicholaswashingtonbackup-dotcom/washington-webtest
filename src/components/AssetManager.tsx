/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { compressBase64Image, SavedAsset, updateAssetLazy } from '../lib/indexeddb-assets';
import { Image as ImageIcon, Upload, Loader2, Trash2, Code, Video, ExternalLink, HelpCircle } from 'lucide-react';

export default function AssetManager() {
  const { assets, loadAssets, uploadNewAsset, deleteOldAsset, pages, activePageId, updateActivePageCanvas, createHistoryCheckpoint } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let dataUrl = e.target?.result as string;
        const sizeBytes = file.size;
        
        // Compress image if it is standard visual jpeg/png
        if (file.type.match(/image\/(jpeg|png)/i)) {
          console.log("[Asset Manager] Compressing upload:", file.name);
          try {
            dataUrl = await compressBase64Image(dataUrl, 1000, 1000, 0.7);
          } catch (compressErr) {
            console.warn("Resize error:", compressErr);
          }
        }

        await uploadNewAsset(file.name, file.type, dataUrl, sizeBytes);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Asset upload failure:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const insertAssetToCanvas = (asset: SavedAsset) => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage) return;

    let assetElement = '';
    
    if (asset.type.includes('svg')) {
      // Decode SVG
      assetElement = `<div class="w-12 h-12 my-4 text-violet-500">${asset.dataUrl}</div>`;
    } else if (asset.type.startsWith('video') || asset.type === 'embed-video') {
      // Embed iframe
      assetElement = `
<div class="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-opacity-10 my-8" style="border-color: rgba(255,255,255,0.1);">
  <iframe class="w-full h-full" src="${asset.dataUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
      `.trim();
    } else {
      // Standard image
      const lazyAttr = asset.lazyLoad ? 'loading="lazy"' : '';
      assetElement = `
<div class="rounded-xl overflow-hidden border my-6 text-center max-w-sm mx-auto shadow-md" style="border-color: rgba(255,255,255,0.08);">
  <img src="${asset.dataUrl}" ${lazyAttr} alt="${asset.name}" class="w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-300" referrerPolicy="no-referrer" />
</div>
      `.trim();
    }

    const nextHTML = activePage.html + "\n" + assetElement;
    updateActivePageCanvas(nextHTML);
    createHistoryCheckpoint(`Inserted Asset: ${asset.name}`);
  };

  const handleVideoEmbed = () => {
    if (!videoUrl) return;

    // Convert Youtube video URL to embed URL format
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('vimeo.com/')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    uploadNewAsset("Video Stream Node", "embed-video", embedUrl, 0);
    setVideoUrl('');
    setShowVideoModal(false);
  };

  const toggleLazy = async (id: string, currentLazy: boolean) => {
    try {
      await updateAssetLazy(id, !currentLazy);
      loadAssets();
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id="asset-manager-module" class="bg-slate-900 border-t border-slate-800 p-5 scrollbar">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
            <ImageIcon class="w-4 h-4 text-violet-400" />
            Asset Manager & Media Studio
          </h3>
          <p class="text-[10px] text-slate-400">Drag imagery or connect visual links. Persisted locally via IndexedDB.</p>
        </div>
        <div class="flex gap-2">
          <button 
            onClick={() => setShowVideoModal(true)} 
            class="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5 transition"
          >
            <Video class="w-3.5 h-3.5 text-rose-400" />
            Embed Video
          </button>
          <button 
            onClick={triggerFileInput}
            class="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-semibold flex items-center gap-1.5 transition"
          >
            <Upload class="w-3.5 h-3.5" />
            Upload File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
            class="hidden" 
            accept="image/*,image/svg+xml"
          />
        </div>
      </div>

      {/* Drag & Drop Canvas */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        class={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          dragActive 
            ? 'border-violet-500 bg-violet-950/20' 
            : 'border-slate-850 bg-slate-950/20 hover:border-slate-700'
        } mb-4`}
      >
        {isUploading ? (
          <div class="flex flex-col items-center gap-2 py-2">
            <Loader2 class="w-6 h-6 animate-spin text-violet-400" />
            <span class="text-xs text-slate-400">Applying canvas optimization scales...</span>
          </div>
        ) : (
          <div class="flex flex-col items-center gap-1.5">
            <Upload class="w-5 h-5 text-slate-500" />
            <span class="text-xs font-semibold text-slate-300">Drag or drop SVG/Image details here</span>
            <span class="text-[10px] text-slate-500 font-mono">Accepts JPG, PNG, WEBP and vectors</span>
          </div>
        )}
      </div>

      {assets.length === 0 ? (
        <div class="text-center py-6 border border-slate-850 rounded-lg bg-slate-950/10 text-slate-500 text-xs italic">
          No media assets uploaded yet. Try adding assets to reuse.
        </div>
      ) : (
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto max-h-48 scrollbar">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              class="group relative border border-slate-850 rounded-lg bg-slate-950/40 overflow-hidden flex flex-col justify-between"
            >
              {/* Image box */}
              <div 
                onClick={() => insertAssetToCanvas(asset)}
                class="aspect-square w-full bg-slate-900 flex items-center justify-center p-2 relative cursor-pointer group"
                title="Click to insert into canvas"
              >
                {asset.type.includes('svg') ? (
                  <div class="w-10 h-10 flex items-center justify-center text-violet-400 svg-clean" dangerouslySetInnerHTML={{ __html: asset.dataUrl }} />
                ) : asset.type === 'embed-video' ? (
                  <div class="w-10 h-10 rounded-lg bg-indigo-950/40 flex items-center justify-center text-indigo-400">
                    <Video class="w-5 h-5" />
                  </div>
                ) : (
                  <img src={asset.dataUrl} alt={asset.name} class="object-cover w-full h-full rounded transition group-hover:scale-105" referrerPolicy="no-referrer" />
                )}
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span class="text-[10px] bg-violet-600 font-bold px-2 py-1 rounded text-white shadow">Use Node</span>
                </div>
              </div>

              {/* Status details */}
              <div class="p-2 border-t border-slate-850 text-[10px] text-slate-400 flex items-center justify-between">
                <div class="truncate max-w-[70px]" title={asset.name}>{asset.name}</div>
                <div class="flex items-center gap-1">
                  <span class="text-[9px] opacity-60">{formatSize(asset.sizeBytes)}</span>
                  <button 
                    onClick={() => deleteOldAsset(asset.id)}
                    class="p-0.5 text-slate-500 hover:text-red-400 transition"
                    title="Delete permanently"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              {asset.type.startsWith('image') && (
                <div class="absolute top-1 left-1.5">
                  <button 
                    onClick={() => toggleLazy(asset.id, asset.lazyLoad)}
                    class={`px-1 py-0.5 rounded text-[8px] font-bold ${asset.lazyLoad ? 'bg-slate-950 text-emerald-400' : 'bg-slate-950 text-slate-400'}`}
                    title="Toggle Lazy Loading"
                  >
                    {asset.lazyLoad ? 'Lazy' : 'Eager'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Embedded video Modal popup */}
      {showVideoModal && (
        <div class="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h4 class="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Video class="w-4 h-4 text-rose-400" />
              Embed Video URL
            </h4>
            <p class="text-xs text-slate-400 mb-4">Paste any YouTube or Vimeo video link to generate safe, fully-styled embed structures.</p>
            
            <input 
              type="text" 
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              class="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 mb-4"
            />

            <div class="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => { setShowVideoModal(false); setVideoUrl(''); }}
                class="px-3 py-2 bg-slate-950 hover:bg-slate-850 rounded-lg text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleVideoEmbed}
                disabled={!videoUrl}
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 rounded-lg text-white font-semibold"
              >
                Embed Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
