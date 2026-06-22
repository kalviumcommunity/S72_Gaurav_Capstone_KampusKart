/**
 * Utility to compress an image file client-side using HTML5 Canvas
 * @param file - The original uploaded image file
 * @param maxWidth - Maximum allowed width for the image (default 1024px)
 * @param quality - Compression quality between 0.1 and 1.0 (default 0.7)
 * @returns A promise that resolves to the compressed File object
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If it's not an image, resolve immediately with the original file
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target?.result) {
        return reject(new Error('File reading failed'));
      }

      const img = new Image();
      img.src = event.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio intact
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas 2D context'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas drawing back into a Blob, then a File object
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};
