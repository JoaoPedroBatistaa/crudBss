import { useState } from 'react';
import styles from './styles.module.css';
import router, { useRouter } from 'next/router';
import PhotoUpload from '@/components/PhotoUpload';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, db, doc, storage } from '@/firebase';
import { DocumentData, Firestore, getDoc } from '@firebase/firestore';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';
import { GetServerSidePropsContext } from 'next';



interface Modality{
  id:string
}
interface ChampionShip {

  logo:string;
  name:string;
  criterion:string;
  description:string;
}

export default function NewFormChampionship({ modalityForm }: { modalityForm: Modality }) {

  function HandleBackButtonClick() {
    window.history.back();
  }

  
  const [championShipData, setChampionShipData] = useState<ChampionShip>({
    logo:"",
    name:"",
    criterion:"",
    description: ""
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


   function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, field: keyof ChampionShip) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>, field: keyof ChampionShip) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }

  function handleTextAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>, field: keyof ChampionShip) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }



  const handleSubmit = async () => {
     setIsLoading(true);

     console.log(isLoading)

   let imageUrl = '';
      if (selectedFile) {
        //const storage = getStorage();
        const storageRef = ref(storage, `championships/${selectedFile.name}`);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
      }



    console.log("imageUrl")
    console.log(imageUrl)

    const referenceCollectionName = 'modalities';
    const referenceId = modalityForm.id;

    const championShipDataWithPhoto = { ...championShipData, logo: imageUrl };


    await addNewDocumentWithReference(
      db,
      'championships', 
      championShipDataWithPhoto, 
      referenceCollectionName, 
      referenceId
    );

    resetForm();
    setIsLoading(false);
  }
    function resetForm() {
    setChampionShipData({
      logo:"",
    name:"",
    criterion:"",
    description: ""
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
       toast.success("Campeonato criado com sucesso!");
       router.push("newChampionship?mdl="+modalityForm.id)
    } catch (e) {
      console.error('Erro ao criar o documento:', e);
       toast.error("Erro ao cadastrar o campeonato!");
    }
  }



  return (
      isLoading ? <Spinner />:
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Campeonatos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONTATO</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

           <div className={styles.form}>
            {previewImage && (
              <div className={styles.previewContainer}>
                <img className={styles.previewImage} src={previewImage} alt="Preview" />
              </div>
            )}
            <p className={styles.label}>Logo do campeonato</p>
            <div className={styles.uploadContainer}>
              <PhotoUpload onChange={handleFileChange} />
            </div>
          </div>


          <div className={styles.form}>
            <p className={styles.label}>Nome do Campeonato</p>
            <input 
              className={styles.field} 
              type="text" 
              onChange={(e) => handleInputChange(e, 'name')}
            />
          </div>

          <div className={styles.form}>
          <p className={styles.label}>Critério do Campeonato</p>
          <select 
            className={styles.field} 
            onChange={(e) => handleSelectChange(e, 'criterion')}
          >
            <option value="">Selecione um critério</option>
            <option value="critério1">Critério 1</option>
            <option value="critério2">Critério 2</option>
            <option value="critério3">Critério 3</option>
          </select>
        </div>

        <div className={styles.form}>
        <p className={styles.label}>Descrição do Campeonato</p>
        <textarea 
          className={styles.field}
          onChange={(e) => handleTextAreaChange(e, 'description')}
        />
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
export async function getServerSideProps(context:GetServerSidePropsContext) {
  const { query } = context;
  const {mdl} = query;
  console.log(mdl)

  return {
    props: {
      modalityForm:{id:mdl},
    },
  };
}
