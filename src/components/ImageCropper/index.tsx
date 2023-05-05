import React, { useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function ImageCropper() {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1, x: 0, y: 0, width: 100 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = () => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imageRef, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const onImageLoaded = (image) => {
    setImageRef(image);
    return false; // Evita que o componente ReactCrop crie um novo img DOM node
  };

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

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

    return canvas.toDataURL('image/jpeg');
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {src && (
        <ReactCrop
          src={src}
          crop={crop}
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