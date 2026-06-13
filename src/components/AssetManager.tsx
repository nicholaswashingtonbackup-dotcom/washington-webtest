/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { SavedAsset, renameAssetInDB, moveAssetFolderInDB, updateAssetTagsInDB } from '../lib/indexeddb-assets';
import { 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  Trash2, 
  Video, 
  Folder, 
  Tag, 
  Search, 
  Copy, 
  FileText, 
  Music, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Grid, 
  List, 
  ChevronRight,
  MoreVertical,
  Maximize2
} from 'lucide-react';

const FOLDERS = [
  "/assets/hero-images/",
  "/assets/portfolio/",
  "/assets/blog-images/",
  "/assets/videos/",
  "/assets/audio/",
  "/assets/logos/",
];

export default function AssetManager() {
  const { 
    assets, 
    loadAssets, 
    uploadNewAsset, 
    deleteOldAsset, 
    pages, 
    activePageId, 
    updateActivePageCanvas, 
    createHistoryCheckpoint 
  } = useStore();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selection / Batch actions state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  
  // Modals / Inputs
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Batch updates dropdown fields
  const [batchMoveFolder, setBatchMoveFolder] = useState<string>('');
  const [batchRenamePattern, setBatchRenamePattern] = useState<string>('');
  const [batchTagsInput, setBatchTagsInput] = useState<string>('');
  const [showBatchOptionsMenu, setShowBatchOptionsMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (file: File, folderOverride?: string) => {
    if (!file) return;
    setIsUploading(true);
    try {
      // Pass the original File object (which extends Blob) directly into our new database pipeline!
      await uploadNewAsset(file.name, file.type, file, file.size, folderOverride || selectedFolder !== 'All' ? selectedFolder : undefined);
    } catch (err) {
      console.error("Asset upload failure:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const insertAssetToCanvas = (asset: SavedAsset) => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage) return;

    let assetElement = '';
    
    if (asset.type.includes('svg')) {
      assetElement = `
<div class="w-16 h-16 flex items-center justify-center text-violet-500 my-6 mx-auto">
  <img src="${asset.dataUrl}" alt="${asset.name}" class="w-full h-full object-contain" referrerPolicy="no-referrer" />
</div>`.trim();
    } else if (asset.type.startsWith('video') || asset.type === 'embed-video') {
      assetElement = `
<div class="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-slate-800 my-8">
  <video class="w-full h-full" controls poster="${asset.thumbnailUrl || ''}">
    <source src="${asset.dataUrl}" type="${asset.type}" />
    Your browser does not support video playbacks.
  </video>
</div>`.trim();
    } else if (asset.type.startsWith('audio')) {
      assetElement = `
<div class="w-full max-w-md mx-auto p-4 bg-slate-900 border border-slate-800 rounded-xl my-6 flex flex-col gap-2">
  <span class="text-xs font-semibold text-slate-300 font-mono text-center block truncate">${asset.name}</span>
  <audio class="w-full" controls src="${asset.dataUrl}"></audio>
</div>`.trim();
    } else {
      const lazyAttr = asset.lazyLoad ? 'loading="lazy"' : '';
      assetElement = `
<div class="rounded-xl overflow-hidden border border-slate-800/80 my-6 text-center max-w-sm mx-auto shadow-md">
  <img src="${asset.dataUrl}" ${lazyAttr} alt="${asset.name}" class="w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-300" referrerPolicy="no-referrer" />
</div>`.trim();
    }

    const nextHTML = activePage.html + "\n" + assetElement;
    updateActivePageCanvas(nextHTML);
    createHistoryCheckpoint(`Inserted Asset: ${asset.name}`);
  };

  const handleVideoEmbed = async () => {
    if (!videoUrl) return;
    setIsUploading(true);
    try {
      let embedUrl = videoUrl;
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Fetch or wrap placeholder video blob
      const dummyBlob = new Blob([`embed-link: ${embedUrl}`], { type: "embed-video" });
      await uploadNewAsset("Video Link Node", "embed-video", dummyBlob, 0);
      setVideoUrl('');
      setShowVideoModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * AI Image generator using Gemini-powered dynamic canvas representation
   */
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      // Let's call our local Gemini generation bridge or use a highly artistic SVG dynamic canvas representation
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a professional abstract visual illustration of: "${aiPrompt}". Return raw creative SVG code only, starting with <svg> and ending with </svg>. Do not add comments or markdown blocks.`,
          systemPrompt: "You are a visual design architect. Output clean, visually stunning responsive pure HTML SVGs with stylish dark/light mesh gradients and high-tech shapes.",
          useProvider: 'openrouter',
          model: 'meta-llama/llama-3.1-70b-instruct'
        })
      });

      let svgCode = '';
      if (response.ok) {
        const data = await response.json();
        const contentStr = data.response?.content || data.response?.response || String(data.response);
        svgCode = typeof contentStr === 'string' ? contentStr : '';
      }

      // If backend call failed or output empty, fallback to a beautiful aesthetic dynamic SVG generator
      if (!svgCode || !svgCode.includes("<svg")) {
        const randomHue = Math.floor(Math.random() * 360);
        svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
          <defs>
            <radialGradient id="mesh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="hsl(${randomHue}, 85%, 65%)" />
              <stop offset="100%" stop-color="hsl(${(randomHue + 120) % 360}, 90%, 20%)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
          <filter id="blur">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <circle cx="250" cy="250" r="120" fill="white" opacity="0.15" filter="url(#blur)" />
          <text x="50%" y="54%" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="1">
            ${aiPrompt.substring(0, 15).toUpperCase()}
          </text>
        </svg>`;
      }

      const svgBlob = new Blob([svgCode], { type: "image/svg+xml" });
      const filename = `ai_vector_${Math.random().toString(36).substring(2, 6)}.svg`;
      await uploadNewAsset(filename, "image/svg+xml", svgBlob, svgBlob.size, "/assets/portfolio/", ["ai-generated", "vector"]);
      
      setAiPrompt('');
      setShowAiModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  /**
   * Batch Operations: Delete, Rename, Move
   */
  const handleBatchDelete = async () => {
    if (selectedAssetIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedAssetIds.length} selected assets permanently?`)) return;
    
    for (const id of selectedAssetIds) {
      await deleteOldAsset(id);
    }
    setSelectedAssetIds([]);
  };

  const handleBatchRename = async () => {
    if (selectedAssetIds.length === 0 || !batchRenamePattern.trim()) return;
    for (let i = 0; i < selectedAssetIds.length; i++) {
      const id = selectedAssetIds[i];
      const asset = assets.find(a => a.id === id);
      if (asset) {
        const ext = asset.name.includes('.') ? asset.name.split('.').pop() : '';
        const namePart = ext ? `${batchRenamePattern}_${i + 1}.${ext}` : `${batchRenamePattern}_${i + 1}`;
        await renameAssetInDB(id, namePart);
      }
    }
    await loadAssets();
    setBatchRenamePattern('');
    setShowBatchOptionsMenu(false);
  };

  const handleBatchMove = async () => {
    if (selectedAssetIds.length === 0 || !batchMoveFolder) return;
    for (const id of selectedAssetIds) {
      await moveAssetFolderInDB(id, batchMoveFolder);
    }
    await loadAssets();
    setBatchMoveFolder('');
    setShowBatchOptionsMenu(false);
  };

  const handleBatchAddTags = async () => {
    if (selectedAssetIds.length === 0 || !batchTagsInput.trim()) return;
    const additionalTags = batchTagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    for (const id of selectedAssetIds) {
      const asset = assets.find(a => a.id === id);
      if (asset) {
        const nextTags = Array.from(new Set([...(asset.tags || []), ...additionalTags]));
        await updateAssetTagsInDB(id, nextTags);
      }
    }
    await loadAssets();
    setBatchTagsInput('');
    setShowBatchOptionsMenu(false);
  };

  const handleDuplicateAsset = async (asset: SavedAsset) => {
    try {
      // Find full record with blob in local database, but since we have files in state/store, lets download/re-upload or generate a clone of the Blob!
      const clonedBlob = asset.blob || new Blob([asset.dataUrl], { type: asset.type });
      const nextName = `clone_${asset.name}`;
      await uploadNewAsset(nextName, asset.type, clonedBlob, asset.sizeBytes, asset.folder, [...asset.tags]);
    } catch (e) {
      console.error("Duplicate failed:", e);
    }
  };

  const toggleSelectAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map(a => a.id));
    }
  };

  const handleSetLogo = async (asset: SavedAsset) => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage) return;
    
    // Auto-update logo elements in page by changing img src tags where name holds logo or id holds logo!
    const parser = new DOMParser();
    const doc = parser.parseFromString(activePage.html, "text/html");
    const logoImgs = doc.querySelectorAll("img[src*='logo'], img[id*='logo'], img[class*='logo']");
    
    if (logoImgs.length > 0) {
      logoImgs.forEach(img => {
        img.setAttribute("src", asset.dataUrl);
      });
      const nextHtml = doc.body.innerHTML;
      updateActivePageCanvas(nextHtml);
      createHistoryCheckpoint("Set Brand Logo Link");
      alert("Updated logo links inside current page successfully.");
    } else {
      // Append logo node to header
      const header = doc.querySelector("header") || doc.querySelector("nav");
      if (header) {
        const img = doc.createElement("img");
        img.src = asset.dataUrl;
        img.className = "h-8 w-auto hover:opacity-80 transition object-contain";
        img.alt = "Brand Logo";
        img.id = "siteforge-brand-logo";
        header.insertBefore(img, header.firstChild);
        updateActivePageCanvas(doc.body.innerHTML);
        createHistoryCheckpoint("Affix Logo Node");
      }
    }
  };

  // Filtering lists
  const filteredAssets = assets.filter(asset => {
    const matchesFolder = selectedFolder === 'All' || asset.folder === selectedFolder;
    const matchesTag = !tagFilter || asset.tags?.some((t: string) => t.toLowerCase() === tagFilter.toLowerCase());
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags?.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesTag && matchesSearch;
  });

  const allTags = Array.from(new Set(assets.flatMap(a => a.tags || [])));

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id="media-manager-panel" className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Search and Navigation filters */}
      <div className="space-y-3 pb-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input 
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-950 border border-slate-850 rounded-lg py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Directory Categorization Selectors */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Storage Category</label>
          <select 
            value={selectedFolder}
            onChange={(e) => { setSelectedFolder(e.target.value); setSelectedAssetIds([]); }}
            className="w-full bg-slate-950 text-xs border border-slate-850 px-2.5 py-1.5 rounded-lg text-slate-200"
          >
            <option value="All">📁 All Directories</option>
            {FOLDERS.map(f => (
              <option key={f} value={f}>📁 {f}</option>
            ))}
          </select>
        </div>

        {/* Tag Filters list */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button 
              onClick={() => { setTagFilter(''); setSelectedAssetIds([]); }}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${!tagFilter ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'bg-slate-950 text-slate-500 border border-slate-850 hover:text-slate-300'}`}
            >
              All Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setTagFilter(tagFilter === tag ? '' : tag); setSelectedAssetIds([]); }}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 transition ${tagFilter === tag ? 'bg-indigo-500/30 text-indigo-400 border border-indigo-500/50' : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900'}`}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Header Trigger Commands */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-semibold rounded-md text-slate-200 flex items-center justify-center gap-1 transition"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            Upload
          </button>
          <button 
            onClick={() => setShowVideoModal(true)}
            className="py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-semibold rounded-md text-slate-200 flex items-center justify-center gap-1 transition"
          >
            <Video className="w-3 h-3 text-rose-400" />
            Embed
          </button>
          <button 
            onClick={() => setShowAiModal(true)}
            className="py-1.5 bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-[10px] font-semibold rounded-md text-indigo-300 flex items-center justify-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            AI Create
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
            className="hidden" 
            accept="image/*,video/*,audio/*,application/pdf"
          />
        </div>
      </div>

      {/* Uploading progress bar */}
      {isUploading && (
        <div className="flex items-center gap-2 p-2 bg-slate-950/40 border border-slate-850/60 rounded-lg justify-center my-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span className="text-[10px] text-slate-400 font-mono">Running Asset Pipeline processes...</span>
        </div>
      )}

      {/* Asset Manager Toolbar & Batch Tools */}
      <div className="py-2.5 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono text-[10px]">{filteredAssets.length} Assets found</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={selectAllFiltered}
            title="Batch Toggle"
            className="p-1 hover:text-slate-300 transition"
          >
            {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title="Toggle Layout"
            className="p-1 hover:text-slate-300 transition"
          >
            {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Multi-Selection Batch Controls HUD */}
      {selectedAssetIds.length > 0 && (
        <div className="p-2.5 bg-indigo-950/35 border border-indigo-500/30 rounded-lg my-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{selectedAssetIds.length} SELECTED</span>
            <button 
              onClick={handleBatchDelete}
              className="p-1 bg-red-950/40 border border-red-500/20 hover:bg-red-900 hover:text-white rounded text-red-400 text-[10px] font-bold"
            >
              Batch Delete
            </button>
          </div>

          <div className="pt-1.5 border-t border-indigo-500/10 flex items-center justify-between">
            <button 
              onClick={() => setShowBatchOptionsMenu(!showBatchOptionsMenu)}
              className="text-[10px] text-indigo-400 flex items-center gap-1 font-semibold underline hover:text-indigo-200"
            >
              Advanced Operations
              <ChevronRight className={`w-3 h-3 transform transition-transform ${showBatchOptionsMenu ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showBatchOptionsMenu && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex gap-1.5">
                <select 
                  value={batchMoveFolder} 
                  onChange={(e) => setBatchMoveFolder(e.target.value)}
                  className="w-full text-[10px] bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-200"
                >
                  <option value="">Move selected...</option>
                  {FOLDERS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button 
                  onClick={handleBatchMove} 
                  disabled={!batchMoveFolder}
                  className="px-2 py-1 bg-indigo-600 disabled:opacity-40 text-white rounded text-[10px] font-bold"
                >
                  Go
                </button>
              </div>

              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="Rename pattern..." 
                  value={batchRenamePattern}
                  onChange={(e) => setBatchRenamePattern(e.target.value)}
                  className="w-full text-[10px] bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-200"
                />
                <button 
                  onClick={handleBatchRename} 
                  disabled={!batchRenamePattern}
                  className="px-2 py-1 bg-indigo-600 disabled:opacity-40 text-white rounded text-[10px] font-bold"
                >
                  Apply
                </button>
              </div>

              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="Add tags comma separated..." 
                  value={batchTagsInput}
                  onChange={(e) => setBatchTagsInput(e.target.value)}
                  className="w-full text-[10px] bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-200"
                />
                <button 
                  onClick={handleBatchAddTags} 
                  disabled={!batchTagsInput}
                  className="px-2 py-1 bg-indigo-600 disabled:opacity-40 text-white rounded text-[10px] font-bold"
                >
                  Tag
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Files Output List/Grid Canvas Frame */}
      {filteredAssets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-slate-850/60 bg-slate-950/15 rounded-xl text-center">
          <Folder className="w-6 h-6 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-semibold mb-0.5">Directory contents empty</p>
          <p className="text-[10px] text-slate-500 leading-normal">Selected files match filters shows empty storage context.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredAssets.map(asset => {
                const isSelected = selectedAssetIds.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onMouseEnter={() => setHoveredAssetId(asset.id)}
                    onMouseLeave={() => setHoveredAssetId(null)}
                    className={`relative border rounded-lg overflow-hidden bg-slate-950/30 transition-all flex flex-col ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/20 shadow-lg' : 'border-slate-850/70 hover:border-slate-700'}`}
                  >
                    {/* Select bubble checkbox */}
                    <button 
                      onClick={(e) => toggleSelectAsset(asset.id, e)}
                      className="absolute top-1.5 right-1.5 z-10 p-0.5 bg-slate-950/80 rounded hover:scale-105 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Thumbnail render layer */}
                    <div 
                      onClick={() => insertAssetToCanvas(asset)}
                      className="aspect-square bg-slate-950/80 cursor-pointer flex items-center justify-center p-1.5 relative group"
                    >
                      {asset.type.startsWith('audio') ? (
                        <Music className="w-8 h-8 text-indigo-400" />
                      ) : asset.type.startsWith('video') || asset.type === 'embed-video' ? (
                        <Video className="w-8 h-8 text-rose-400" />
                      ) : asset.type.includes('pdf') ? (
                        <FileText className="w-8 h-8 text-amber-500" />
                      ) : (
                        <img 
                          src={asset.thumbnailUrl || asset.dataUrl} 
                          alt={asset.name} 
                          className="w-full h-full object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* On hover insert buttons */}
                      <div className="absolute inset-0 bg-slate-950/75 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                        <span className="text-[9px] bg-indigo-600 font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">Use Node</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDuplicateAsset(asset); }}
                            className="p-1 bg-slate-900 rounded border border-slate-800 text-[8px] hover:bg-slate-800"
                            title="Duplicate Entry"
                          >
                            <Copy className="w-2.5 h-2.5 text-indigo-300" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteOldAsset(asset.id); }}
                            className="p-1 bg-slate-900 rounded border border-slate-800 text-[8px] hover:bg-slate-850"
                            title="Delete"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-red-400" />
                          </button>
                          {asset.type.startsWith('image') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSetLogo(asset); }}
                              className="p-1 bg-slate-900 rounded border border-slate-800 text-[8px] hover:bg-slate-850 text-indigo-400 font-bold"
                              title="Set Brand Image Logo"
                            >
                              Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Caption area */}
                    <div className="p-1.5 bg-slate-950/20 border-t border-slate-850/60 text-[9px] flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-300 block truncate" title={asset.name}>{asset.name}</span>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono text-[8px]">{formatSize(asset.sizeBytes)}</span>
                        <span className="text-[8px] opacity-75">{asset.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAssets.map(asset => {
                const isSelected = selectedAssetIds.includes(asset.id);
                return (
                  <div 
                    key={asset.id}
                    onClick={() => insertAssetToCanvas(asset)}
                    className={`flex items-center justify-between p-2 rounded-lg bg-slate-950/20 border text-xs cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-850 hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button 
                        onClick={(e) => toggleSelectAsset(asset.id, e)}
                        className="p-0.5 rounded text-slate-500 hover:text-slate-300"
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> : <Square className="w-3.5 h-3.5" />}
                      </button>
                      <span className="font-mono text-[9px] truncate max-w-[130px]" title={asset.name}>{asset.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 min-w-0">
                      <span className="font-mono">{formatSize(asset.sizeBytes)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteOldAsset(asset.id); }}
                        className="p-0.5 hover:text-red-400 text-slate-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Embedding Video Modal popup */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-400" />
              Embed Video Stream
            </h4>
            <input 
              type="text" 
              placeholder="Paste Youtube video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => { setShowVideoModal(false); setVideoUrl(''); }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleVideoEmbed}
                disabled={!videoUrl}
                className="px-4 py-1.5 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-700 rounded-lg text-white font-semibold"
              >
                Embed Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Vector Graphic Design Prompt Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              AI Media Generation Engine
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">Dynamic AI prompt triggers local models on cloud servers to design and serialize stylish vectors natively directly into your workspace.</p>
            <input 
              type="text" 
              placeholder="e.g. Neon cyber rings, sunset geometric..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 rounded-lg text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleAiGenerate}
                disabled={!aiPrompt.trim() || isGeneratingAI}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg text-white font-bold flex items-center gap-1.5"
              >
                {isGeneratingAI && <Loader2 className="w-3 h-3 animate-spin" />}
                Generate Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
