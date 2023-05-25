import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';

const AvatarEditorComponent = () => {
  const [image, setImage] = useState(null);
  const editorRef = useRef(null);
    const [croppedImage, setCroppedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSave = () => {
  if (editorRef.current) {
    const canvas = editorRef.current.getImageScaledToCanvas();
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 90;
    finalCanvas.height = 90;
    const ctx = finalCanvas.getContext('2d');
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(45, 45, 45, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(canvas, 0, 0, 90, 90);

    ctx.restore();

    const croppedImageDataURL = finalCanvas.toDataURL();
    setCroppedImage(croppedImageDataURL);

    console.log("croppedImage")
    console.log(croppedImage)
  }
};

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      {image && (
        <div>
          <AvatarEditor
           ref={editorRef}
            image={image}
            width={120}
            height={120}
            border={50}
            borderRadius={60} // Adicione esta linha para tornar o recorte redondo
            color={[255, 255, 255, 0.6]} // RGBA
            scale={1.2}
          />
          <button onClick={handleSave}>Salvar Avatar</button>
        </div>
      )}
    </div>
  );
};

export default AvatarEditorComponent;