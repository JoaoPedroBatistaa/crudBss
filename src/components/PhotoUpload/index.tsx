
import { useRef } from 'react';

interface PhotoUploadProps {
  onChange: (file: File | null) => void;
}

const PhotoUpload = ({ onChange }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0] || null;
    onChange(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
    </div>
  );
};

export default PhotoUpload;