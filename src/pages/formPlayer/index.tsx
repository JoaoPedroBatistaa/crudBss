
import { useRef, useState } from 'react';
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { collection, addDoc, doc, getDoc,db,storage} from '../../firebase'
import { DocumentData, Firestore, } from '@firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../cropImage'; 
import ReactCrop, { Crop } from 'react-image-crop';




interface Modality{
  id:string
}

interface Player {
  totalScore:Number,
  instagram?:string,
  mpvOfTheGames:Number,
  mvpOfTheChampionship:Number,
  name:string,
  photo?:string,
  threePointers:Number,
  topScorersOfTheChampionship:Number,
  topScorersOfTheGame:Number
  position:string
}

export default function FormPlayer({ data }: { data: Modality }) {



  const [isLoading, setIsLoading] = useState(false);

   const [playerData, setPlayerData] = useState<Player>({
    totalScore: 0,
    mpvOfTheGames: 0,
    mvpOfTheChampionship: 0,
    name: '',
    threePointers: 0,
    topScorersOfTheChampionship: 0,
    topScorersOfTheGame: 0,
    position:'' 
  });


  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);

    const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    aspect: 1,
  });

  const [src, setSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };


    const onImageLoaded = (image: HTMLImageElement) => {
    setImageRef(image);
  };

  const onCropComplete = (crop: Crop) => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImage(
        imageRef,
        crop,
        'newFile.jpeg'
      );
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const getCroppedImage = (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );

    return canvas.toDataURL('image/jpeg');
  };

  // const onCropChange = (newCrop) => {
  //   setCrop(newCrop);
  // };

  // const onZoomChange = (newZoom) => {
  //   setZoom(newZoom);
  // };

  // const onCropComplete = async (croppedAreaPixels) => {
  //   if (!file) return;

  //   const croppedImageUrl = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels);
  //   setCroppedImage(croppedImageUrl);
  //   setShowCropper(false);
  // };

  // function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const files = event.target.files;
  //   if (files && files.length > 0) {
  //     setFile(files[0]);
  //     setShowCropper(true);
  //   }
  // }

  const closeModal = () => {
    setShowCropper(false);
  };

  function resetForm() {
    setPlayerData({
    totalScore: 0,
      mpvOfTheGames: 0,
      mvpOfTheChampionship: 0,
      name: '',
      threePointers: 0,
      topScorersOfTheChampionship: 0,
      topScorersOfTheGame: 0,
      position:'' 
    });
    setFile(null);
  }


 function handleInputChange(event: React.ChangeEvent<HTMLInputElement>, field: keyof Player) {
    setPlayerData({
      ...playerData,
      [field]: event.target.value,
    });
  }

  async function uploadImageAndGetDownloadURL(imageFile: File): Promise<string | null> {
    try {

      const storageRef = ref(storage, `players-photos/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
      return null;
    }
  }

  function HandleBackButtonClick() {
    window.history.back();
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
      const newData = { ...data, reference };
      const docRef = await addDoc(collection(db, collectionName), newData);
      console.log('Documento criado com sucesso. ID:', docRef.id);
       toast.success("Jogador cadastrado com sucesso!");
    } catch (e) {
      console.error('Erro ao criar o documento:', e);
       toast.success("Erro ao cadastrar o Jogador!");
    }
  }

  async function handleSubmit() {
     setIsLoading(true);

     console.log(isLoading)
    let photoURL = null;
    if (file) {
      photoURL = await uploadImageAndGetDownloadURL(file);
    }
    const referenceCollectionName = 'modalities';
    const referenceId = data.id;

    const playerDataWithPhoto = { ...playerData, photo: photoURL };


    await addNewDocumentWithReference(
      db,
      'players', 
      playerDataWithPhoto, 
      referenceCollectionName, 
      referenceId
    );

    resetForm();
    setIsLoading(false);
  }

  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Jogadores</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGADOR</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Jogador</p>
            <input 
                className={styles.field} 
                type="text" 
                value={playerData.name}
                onChange={(e) => handleInputChange(e, 'name')}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Foto do Jogador</p>
            <input 
                className={styles.fieldFile} 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
            />
             {
              src && (
              <div>
                <ReactCrop
                  src={src}
                  crop={crop}
                  ruleOfThirds
                  onImageLoaded={onImageLoaded}
                  onComplete={onCropComplete}
                  onChange={(newCrop) => setCrop(newCrop)}
                />
                <button onClick={() => setSrc(null)}>Fechar crop</button>
              </div>
              )}
              {croppedImageUrl && (
                <img
                  className={styles.croppedImage}
                  src={croppedImageUrl}
                  alt="Cropped Image"
                />
              )}
           
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Posição</p>
            <input 
              className={styles.field} 
              type="text" 
              value={playerData.position}
              onChange={(e) => handleInputChange(e, 'position')}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação total</p>
            <input className={styles.field} 
              type="number"  
              value={playerData.totalScore.toString()}
              onChange={(e) => handleInputChange(e, 'totalScore')}/>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Bolas de três</p>
            <input 
              className={styles.field} 
              type="number" 
              value={playerData.threePointers.toString()}
              onChange={(e) => handleInputChange(e, 'threePointers')}
              />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVP's partida</p>
            <input 
              className={styles.field} 
              type="number" 
              value={playerData.mpvOfTheGames.toString()}
              onChange={(e) => handleInputChange(e, 'mpvOfTheGames')}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVP's campeonato</p>
            <input 
              className={styles.field} 
              type="number" 
              value={playerData.mvpOfTheChampionship.toString()}
              onChange={(e) => handleInputChange(e, 'mvpOfTheChampionship')}
              />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas partida</p>
            <input 
                className={styles.field} 
                type="number" 
                 value={playerData.topScorersOfTheGame.toString()}
                onChange={(e) => handleInputChange(e, 'topScorersOfTheGame')}    
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas campeonato</p>
            <input 
              className={styles.field} 
              type="number" 
              value={playerData.topScorersOfTheChampionship.toString()}
              onChange={(e) => handleInputChange(e, 'topScorersOfTheChampionship')} 
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Instagram</p>
            <input 
              className={styles.field} 
              type="text" 
               value={playerData.instagram}
              onChange={(e) => handleInputChange(e, 'instagram')} 
            />
          </div>
        </div>

        <button 
          className={styles.save} 
          onClick={handleSubmit}
          disabled={isLoading}
          >
            SALVAR  
        </button>

        <button 
          className={styles.back} 
          onClick={HandleBackButtonClick}
        >
          Voltar
          </button>

          {showCropper && (
  <div >
    <div >
      <Cropper
        image={URL.createObjectURL(file)}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropComplete}
      />
      <button className={styles.closeButton} onClick={closeModal}>×</button>
    </div>
  </div>
)}
        
      </div>
           {
            isLoading && (
            <Spinner></Spinner>
          )}
          
          
     
    </>
   
  )
}


export async function getServerSideProps(context:GetServerSidePropsContext) {
  const { query } = context;
  const {mdl} = query;
  console.log(mdl)

  return {
    props: {
      data:{id:mdl}
    },
  };
}
