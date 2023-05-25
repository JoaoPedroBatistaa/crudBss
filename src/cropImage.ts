import domtoimage from 'dom-to-image';

export default async function getCroppedImg(imageSrc, crop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => image.onload = resolve);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
  
  const dataUrl = await domtoimage.toPng(canvas);
  const croppedImage = new Image();
  croppedImage.src = dataUrl;
  await new Promise((resolve) => croppedImage.onload = resolve);

  const x = crop.x - (safeArea / 2 - image.width * 0.5);
  const y = crop.y - (safeArea / 2 - image.height * 0.5);

  canvas.width = crop.width;
  canvas.height = crop.height;

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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg');
  });
}