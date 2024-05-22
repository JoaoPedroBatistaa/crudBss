import PhotoUpload from "@/components/PhotoUpload";
import Spinner from "@/components/Spinner";
import { addDoc, collection, db, storage } from "@/firebase";
import { DocumentData, Firestore } from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface New {
  title: string;
  image: string;
}

export default function NewFormNews({
  modalityForm,
}: {
  modalityForm: Modality;
}) {
  const [newData, setNewData] = useState<New>({
    title: "",
    image: "",
  });

  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof New
  ) {
    const value = event.target.value;

    setNewData({
      ...newData,
      [field]: value,
    });
  }

  async function handleSubmit() {
    setIsLoading(true);

    let imageUrl = "";
    if (selectedFile) {
      const storageRef = ref(storage, `sponsors/${selectedFile.name}`);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(fileSnapshot.ref);
    }

    const newWithPhoto = { ...newData, image: imageUrl };

    await addNewDocumentWithReference(db, "sponsors", newWithPhoto);

    resetForm();
    setIsLoading(false);
  }

  function resetForm() {
    setNewData({
      title: "",
      image: "",
    });

    setPreviewImage(null);
    setSelectedFile(null);
  }

  async function addNewDocumentWithReference(
    db: Firestore,
    collectionName: string,
    data: DocumentData
  ) {
    try {
      const newData = { ...data };
      const docRef = await addDoc(collection(db, collectionName), newData);
      console.log("Documento criado com sucesso. ID:", docRef.id);
      toast.success("Notícia criada com sucesso!");
      router.push("/newSponsor");
    } catch (e) {
      console.error("Erro ao criar o documento:", e);
      toast.error("Erro ao cadastrar a notícia!");
    }
  }

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Patrocinadores</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO PATROCINADOR</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>
          <div className={styles.form}>
            <p className={styles.label}>Nome</p>
            <input
              className={styles.field}
              type="text"
              value={newData.title}
              onChange={(e) => handleInputChange(e, "title")}
            />
          </div>

          <div className={styles.form}>
            {previewImage && (
              <div className={styles.previewContainer}>
                <img
                  className={styles.previewImage}
                  src={previewImage}
                  alt="Preview"
                />
              </div>
            )}
            <p className={styles.label}>Imagem</p>
            <div className={styles.fieldFile}>
              <PhotoUpload onChange={handleFileChange} />
            </div>
          </div>

          <button
            className={styles.save}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            SALVAR
          </button>
        </div>
        <button className={styles.back} onClick={handleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
