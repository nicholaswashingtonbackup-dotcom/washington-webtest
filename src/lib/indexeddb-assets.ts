/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SavedAsset {
  id: string;
  name: string; // filename
  type: string; // mime
  dataUrl: string; // runtime dynamic Object URL of main blob
  timestamp: number;
  lazyLoad: boolean;
  sizeBytes: number;
  
  // Module 2 features
  tags: string[];
  folder: string;
  
  // Real Blobs stored in DB (transient during load, or stored permanently in DB schema)
  blob?: Blob;
  thumbnailUrl: string;
  faviconUrl: string;
  
  responsiveUrls?: {
    mobile?: string;
    tablet?: string;
    smallDesktop?: string;
    fullDesktop?: string;
    retina?: string;
    thumbnail?: string;
    favicon?: string;
  };
}

const DB_NAME = "SiteForgeMedia";
const STORE_NAME = "siteforge_media";
const DB_VERSION = 1;

// Global tracker of created Object URLs to prevent browser memory leaks
let activeObjectUrls: string[] = [];

export function clearTransientUrls() {
  activeObjectUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  });
  activeObjectUrls = [];
}

function createTransientUrl(blob: Blob): string {
  if (!blob || blob.size === 0) return '';
  const url = URL.createObjectURL(blob);
  activeObjectUrls.push(url);
  return url;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Process uploaded Image or Video and store inside siteforge_media as actual BLOBs
 */
export async function saveAsset(
  name: string,
  type: string,
  inputBlob: Blob,
  folderSelected?: string,
  customTags?: string[]
): Promise<SavedAsset> {
  const db = await getDB();
  const id = "asset_" + Math.random().toString(36).substring(2, 11);
  const sizeBytes = inputBlob.size;

  // Determine standard folder based on mime & filename
  let folder = "/assets/portfolio/";
  if (folderSelected) {
    folder = folderSelected;
  } else if (type.startsWith("video")) {
    folder = "/assets/videos/";
  } else if (type.startsWith("audio")) {
    folder = "/assets/audio/";
  } else if (name.toLowerCase().includes("logo")) {
    folder = "/assets/logos/";
  } else if (name.toLowerCase().includes("hero")) {
    folder = "/assets/hero-images/";
  } else if (name.toLowerCase().includes("blog")) {
    folder = "/assets/blog-images/";
  }

  // Determine standard tags
  const tags = customTags || ["media"];
  if (type.startsWith("image")) tags.push("image");
  if (type.startsWith("video")) tags.push("video");
  if (type.startsWith("audio")) tags.push("audio");

  // Dynamic responsive pipeline blocks
  let thumbnailBlob: Blob | undefined;
  let faviconBlob: Blob | undefined;
  
  const responsiveBlobs: Record<string, Blob> = {};

  if (type.startsWith("image") && !type.includes("svg")) {
    try {
      const img = await loadImageElement(inputBlob);
      
      // Auto-generate responsive widths
      const widths = {
        mobile: 320,
        tablet: 768,
        smallDesktop: 1024,
        fullDesktop: 1920,
        retina: 2560
      };

      for (const [key, w] of Object.entries(widths)) {
        if (img.width >= w) {
          responsiveBlobs[key] = await resizeImageToBlob(img, w, Math.round(w * (img.height / img.width)));
        } else {
          // If original image is smaller, use original to avoid upscaling blur
          responsiveBlobs[key] = inputBlob;
        }
      }

      // 150x150 thumbnail
      thumbnailBlob = await cropAndResizeImage(img, 150, 150);
      // 80x80 favicon
      faviconBlob = await cropAndResizeImage(img, 80, 80);

    } catch (err) {
      console.warn("Failed to apply asset pipeline processing, saving original:", err);
    }
  } else if (type.startsWith("video")) {
    try {
      thumbnailBlob = await extractVideoPosterFrame(inputBlob);
    } catch (err) {
      console.warn("Failed video frame extraction:", err);
    }
  }

  // Save entry in DB
  const assetRecord = {
    id,
    name,
    type,
    timestamp: Date.now(),
    lazyLoad: true,
    sizeBytes,
    tags,
    folder,
    blob: inputBlob,
    thumbnailBlob,
    faviconBlob,
    responsiveBlobs
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(assetRecord);
    
    request.onsuccess = () => {
      // Build runtime representation with dynamic URLs
      resolve({
        id,
        name,
        type,
        timestamp: assetRecord.timestamp,
        lazyLoad: true,
        sizeBytes,
        tags,
        folder,
        dataUrl: createTransientUrl(inputBlob),
        thumbnailUrl: thumbnailBlob ? createTransientUrl(thumbnailBlob) : '',
        faviconUrl: faviconBlob ? createTransientUrl(faviconBlob) : '',
        responsiveUrls: {
          mobile: responsiveBlobs.mobile ? createTransientUrl(responsiveBlobs.mobile) : '',
          tablet: responsiveBlobs.tablet ? createTransientUrl(responsiveBlobs.tablet) : '',
          smallDesktop: responsiveBlobs.smallDesktop ? createTransientUrl(responsiveBlobs.smallDesktop) : '',
          fullDesktop: responsiveBlobs.fullDesktop ? createTransientUrl(responsiveBlobs.fullDesktop) : '',
          retina: responsiveBlobs.retina ? createTransientUrl(responsiveBlobs.retina) : '',
          thumbnail: thumbnailBlob ? createTransientUrl(thumbnailBlob) : '',
          favicon: faviconBlob ? createTransientUrl(faviconBlob) : ''
        }
      });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Fetch all media assets and generate their URL objects dynamically
 */
export async function getAssets(): Promise<SavedAsset[]> {
  const db = await getDB();
  
  // Revoke previous URLs to keep memory lightweight
  clearTransientUrls();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const dbRecords = request.result || [];
      const mapped = dbRecords.map((rec: any) => {
        const primaryUrl = createTransientUrl(rec.blob);
        const thumbUrl = rec.thumbnailBlob ? createTransientUrl(rec.thumbnailBlob) : primaryUrl;
        const favUrl = rec.faviconBlob ? createTransientUrl(rec.faviconBlob) : thumbUrl;

        const responsiveUrls: Record<string, string> = {};
        if (rec.responsiveBlobs) {
          for (const [key, b] of Object.entries(rec.responsiveBlobs)) {
            responsiveUrls[key] = createTransientUrl(b as Blob);
          }
        }

        return {
          id: rec.id,
          name: rec.name,
          type: rec.type,
          timestamp: rec.timestamp,
          lazyLoad: rec.lazyLoad !== undefined ? rec.lazyLoad : true,
          sizeBytes: rec.sizeBytes,
          tags: rec.tags || ["media"],
          folder: rec.folder || "/assets/portfolio/",
          dataUrl: primaryUrl,
          thumbnailUrl: thumbUrl,
          faviconUrl: favUrl,
          responsiveUrls: responsiveUrls
        } as SavedAsset;
      });
      
      resolve(mapped);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateAssetLazy(id: string, lazyLoad: boolean): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.lazyLoad = lazyLoad;
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Bulk rename helper
 */
export async function renameAssetInDB(id: string, nextName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.name = nextName;
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Move folder helper
 */
export async function moveAssetFolderInDB(id: string, nextFolder: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.folder = nextFolder;
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Tag updates helper
 */
export async function updateAssetTagsInDB(id: string, nextTags: string[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.tags = nextTags;
        const putReq = store.put(data);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// -------------------------------------------------------------
// CORE UNDERLYING VISUAL PROCESSING HELPERS
// -------------------------------------------------------------

function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
}

function resizeImageToBlob(img: HTMLImageElement, width: number, height: number, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, "image/webp", quality);
    } else {
      resolve(new Blob());
    }
  });
}

function cropAndResizeImage(img: HTMLImageElement, width: number, height: number, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Square Centering Crop Math
      const sourceAspect = img.width / img.height;
      const targetAspect = width / height;
      
      let sX = 0, sY = 0, sW = img.width, sH = img.height;
      
      if (sourceAspect > targetAspect) {
        // Source is wider
        sW = img.height * targetAspect;
        sX = (img.width - sW) / 2;
      } else if (sourceAspect < targetAspect) {
        // Source is taller
        sH = img.width / targetAspect;
        sY = (img.height - sH) / 2;
      }
      
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, "image/webp", quality);
    } else {
      resolve(new Blob());
    }
  });
}

function extractVideoPosterFrame(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    
    const url = URL.createObjectURL(blob);
    video.src = url;
    
    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => {
          URL.revokeObjectURL(url);
          resolve(b || new Blob());
        }, "image/webp", 0.75);
      } else {
        URL.revokeObjectURL(url);
        resolve(new Blob());
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to capture video poster frame"));
    };
  });
}

/**
 * Backward compatible compression placeholder
 */
export function compressBase64Image(dataUrl: string, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    resolve(dataUrl);
  });
}
