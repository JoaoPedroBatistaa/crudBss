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
  description: string;
  link: string;
  date: string; // Adicione o campo "date" na interface
}

export default function NewFormNews({
  modalityForm,
}: {
  modalityForm: Modality;
}) {
  const [newData, setNewData] = useState<New>({
    title: "",
    image: "",
    description: "",
    link: "",
    date: "", // Inicialize com uma string vazia
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
    const value =
      field === "date" ? event.target.value.split("T")[0] : event.target.value;

    setNewData({
      ...newData,
      [field]: value,
    });
  }

  async function handleSubmit() {
    setIsLoading(true);

    let imageUrl = "";
    if (selectedFile) {
      const storageRef = ref(storage, `news/${selectedFile.name}`);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(fileSnapshot.ref);
    }

    const newWithPhoto = { ...newData, image: imageUrl };

    await addNewDocumentWithReference(db, "news", newWithPhoto);

    resetForm();
    setIsLoading(false);
  }

  function resetForm() {
    setNewData({
      title: "",
      image: "",
      description: "",
      link: "",
      date: "",
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
      router.push("/newNews");
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
            <h1 className={styles.title}>Notícias</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVA NOTÍCIA</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>
          <div className={styles.form}>
            <p className={styles.label}>Manchete</p>
            <input
              className={styles.field}
              type="text"
              value={newData.title}
              onChange={(e) => handleInputChange(e, "title")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Descrição</p>
            <input
              className={styles.field}
              type="text"
              value={newData.description}
              onChange={(e) => handleInputChange(e, "description")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Link</p>
            <input
              className={styles.field}
              type="text"
              value={newData.link}
              onChange={(e) => handleInputChange(e, "link")}
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

          <div className={styles.form}>
            <p className={styles.label}>Data</p>
            <input
              className={styles.field}
              type="date"
              value={newData.date}
              onChange={(e) => handleInputChange(e, "date")}
            />
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
