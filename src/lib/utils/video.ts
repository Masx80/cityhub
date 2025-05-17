/**
 * Generate thumbnails from a video file
 * @param file Video file
 * @param frameCount Number of thumbnails to generate
 * @returns Array of thumbnail data URLs
 */
export const generateThumbnails = (
  file: File,
  frameCount = 5
): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const thumbnails: string[] = [];

    if (!context) {
      reject(new Error("Canvas context unavailable"));
      return;
    }

    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      const duration = video.duration;
      const interval = duration / (frameCount + 1); // +1 to avoid very beginning and end
      let currentFrame = 1; // Start from 1 to skip the very beginning

      const captureFrame = () => {
        if (currentFrame > frameCount) {
          URL.revokeObjectURL(video.src);
          resolve(thumbnails);
          return;
        }

        video.currentTime = currentFrame * interval;
        currentFrame++;
      };

      video.addEventListener("seeked", () => {
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Enable image smoothing for better quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Draw the video frame on the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to JPEG with 85% quality
        const thumbnail = canvas.toDataURL("image/jpeg", 0.85);
        thumbnails.push(thumbnail);

        // Capture the next frame
        captureFrame();
      });

      captureFrame();
    });

    video.addEventListener("error", (e) => {
      URL.revokeObjectURL(video.src);
      reject(new Error(`Failed to load video: ${e.message}`));
    });
  });
};

/**
 * Convert base64 data URL to File object
 * @param base64 Base64 data URL
 * @param filename Name of the file
 * @returns File object
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
