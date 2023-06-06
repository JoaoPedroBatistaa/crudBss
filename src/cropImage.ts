import domtoimage from 'dom-to-image';

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default async function getCroppedImg(imageSrc: string, crop: Crop): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  if (ctx) {
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );
  }

  const dataUrl = await domtoimage.toPng(canvas);
  const croppedImage = new Image();
  croppedImage.src = dataUrl;
  await new Promise((resolve) => (croppedImage.onload = resolve));

  const x = crop.x - (safeArea / 2 - image.width * 0.5);
  const y = crop.y - (safeArea / 2 - image.height * 0.5);

  canvas.width = crop.width;
  canvas.height = crop.height;

  if (ctx) {
    ctx.clearRect(0, 0, crop.width, crop.height);
    ctx.drawImage(
      croppedImage,
      x,
      y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
  }

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        reject(new Error('Failed to create image blob.'));
      }
    }, 'image/jpeg');
  });
}
