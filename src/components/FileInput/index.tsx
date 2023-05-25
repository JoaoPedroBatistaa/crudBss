import React, { useRef } from "react";
import styles from "./styles.module.css";

type FileInputProps = {
  id: string;
  label: string | JSX.Element;
  onSelectFile: (file: File | null) => void;
};

function FileInput({ id, label, onSelectFile }: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onSelectFile(selectedFile);
  };

  return (
    <div>
      <label htmlFor={id} className={styles.fileLabel} onClick={handleImageClick}>
        {label}
      </label>
      <input type="file" id={id} ref={fileInputRef} onChange={handleFileSelected} className={styles.fileInput} />
    </div>
  );
}

export default FileInput;