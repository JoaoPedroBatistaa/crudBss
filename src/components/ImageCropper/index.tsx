import React, { useState } from 'react';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


function ImageCropper() {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ 
    aspect: 1, 
    x: 0, 
    y: 0, 
    width: 100,
    height: 100,
    unit: '%'
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = (crop: Crop, percentCrop: PercentCrop) => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imageRef, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  };
  
  const onCropChange = (crop: Crop, percentCrop: PercentCrop) => {
    setCrop(crop);
  };
  
  const onImageLoaded = (image: HTMLImageElement) => {
    setImageRef(image);
    return false;
  };

  

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width || 0;
    canvas.height = crop.height || 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }
    if (crop.x !== undefined && crop.y !== undefined && crop.width !== undefined && crop.height !== undefined) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }
    return canvas.toDataURL('image/jpeg');
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {src && (
        <ReactCrop
          src={src}
          crop={crop as any} // Use "as any" para contornar o erro de tipagem
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={onCropChange}
        />
      )}
      {croppedImageUrl && (
        <div>
          <h4>Imagem cortada:</h4>
          <img alt="Cropped" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
        </div>
      )}
    </div>
  );
}

export default ImageCropper;
