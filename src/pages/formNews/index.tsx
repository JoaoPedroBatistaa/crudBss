import { GetServerSidePropsContext } from 'next';
import styles from './styles.module.css';
import { useState } from 'react';
import router, { useRouter } from 'next/router';
import PhotoUpload from '@/components/PhotoUpload';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, db, doc, storage } from '@/firebase';
import { DocumentData, Firestore, getDoc } from '@firebase/firestore';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';

interface Modality {
  id: string
}

interface New {
  id: string;
  title: string;
  image: string
}

export default function NewFormNews({ modalityForm }: 
  { modalityForm: Modality }) {

  function HandleBackButtonClick() {
    window.history.back();
  }

  
  const [newData, setNewData] = useState<New>({
    id: "",
    title:"",
    image:""
  });

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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, field: keyof New) {
    setNewData({
      ...newData,
      [field]: event.target.value,
    });
  }


    const handleSubmit = async () => {
     setIsLoading(true);

     console.log(isLoading)

   let imageUrl = '';
      if (selectedFile) {
        //const storage = getStorage();
        const storageRef = ref(storage, `news/${selectedFile.name}`);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
      }



    console.log("imageUrl")
    console.log(imageUrl)

    const referenceCollectionName = 'modalities';
    const referenceId = modalityForm.id;

    const newWithPhoto = { ...newData, image: imageUrl };


    await addNewDocumentWithReference(
      db,
      'championships', 
      newWithPhoto, 
      referenceCollectionName, 
      referenceId
    );

    resetForm();
    setIsLoading(false);
  }
  
  function resetForm() {
    setNewData({
      id:"",
      image:"",
     title:""
    });

    setPreviewImage(null)
    setSelectedFile(null)
  }


  async function addNewDocumentWithReference(
    db: Firestore,
    collectionName: string,
    data: DocumentData,
    referenceCollectionName: string,
    referenceId: string
  ) {
    const reference = doc(db, referenceCollectionName, referenceId);
    const referenceDoc = await getDoc(reference);

    if (!referenceDoc.exists()) {
      toast.error("Modalidade nãoe encontrada!");
      console.error('Objeto de referência não encontrado');
      return;
    }

    try {
      const newData = { ...data, modality:reference };
      const docRef = await addDoc(collection(db, collectionName), newData);
      console.log('Documento criado com sucesso. ID:', docRef.id);
       toast.success("Noticia criada com sucesso!");
       router.push("newNew?mdl="+modalityForm.id)
    } catch (e) {
      console.error('Erro ao criar o documento:', e);
       toast.error("Erro ao cadastrar a noticia!");
    }
  }


  return (
    isLoading ? <Spinner />:
    <>
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
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Foto</p>
            <input className={styles.fieldFile} type="file" accept="image/*" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Descrição</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Data</p>
            <input className={styles.field} type="date" />
          </div>


        </div>

        <button 
          className={styles.save} 
          onClick={handleSubmit}
          disabled={isLoading}
          >SALVAR
          </button>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
const { query } = context;
const { mdl } = query;
console.log(mdl);

return {
props: {
data: { id: mdl },
},
};
}