import Spinner from "@/components/Spinner";
import { DocumentData, Firestore } from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import {
  addDoc,
  collection,
  db,
  doc,
  getDoc,
  getDownloadURL,
  ref,
  storage,
  uploadBytesResumable,
} from "../../firebase";
import styles from "./styles.module.css";

import CustomModal from "@/components/CustomModal";
import { useRouter } from "next/router";

import SearchSelectTeam from "@/components/SearchSelectTeam";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface Player {
  totalScore: Number;
  instagram?: string;
  mpvOfTheGames: Number;
  mvpOfTheChampionship: Number;
  name: string;
  photo?: string;
  threePointers: Number;
  topScorersOfTheChampionship: Number;
  topScorersOfTheGame: Number;
  kingplayer: Number;
  position: string;
  cpf: string;
  birthDate: string;
  team?: string;
  teamLogo?: string;
}

// Modal.setAppElement('#root');
export default function FormPlayer({ data }: { data: Modality }) {
  const [modality, setModality] = useState(data);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isFileInputOpen, setIsFileInputOpen] = useState(false);
  const router = useRouter();

  const [playerData, setPlayerData] = useState<Player>({
    totalScore: 0,
    mpvOfTheGames: 0,
    mvpOfTheChampionship: 0,
    name: "",
    threePointers: 0,
    topScorersOfTheChampionship: 0,
    topScorersOfTheGame: 0,
    kingplayer: 0,
    position: "",
    instagram: "",
    cpf: "",
    birthDate: "",
  });

  const handleImageClick = () => {
    if (!isFileInputOpen) {
      setIsFileInputOpen(true);
      fileInputRef.current?.click();
    }
  };
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState("");
  const editorRef = useRef<AvatarEditor | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFileInputOpen(false);
    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
            setModalOpen(true);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas =
        editorRef.current.getImageScaledToCanvas() as HTMLCanvasElement;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = 90;
      finalCanvas.height = 90;
      const ctx = finalCanvas.getContext("2d") ?? undefined;

      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(45, 45, 45, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(canvas, 0, 0, 90, 90);

        ctx.restore();

        const croppedImageDataURL = finalCanvas.toDataURL();
        setCroppedImage(croppedImageDataURL);
        setModalOpen(false);
      }
    }
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  // const handleSave = () => {
  //   console.log('Salvar');
  //   setModalOpen(false);
  // };

  function resetForm() {
    setPlayerData({
      totalScore: 0,
      mpvOfTheGames: 0,
      mvpOfTheChampionship: 0,
      name: "",
      threePointers: 0,
      topScorersOfTheChampionship: 0,
      topScorersOfTheGame: 0,
      kingplayer: 0,
      position: "",
      instagram: "",
      cpf: "",
      birthDate: "",
    });
    setCroppedImage("");
    setImage("");
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof Player
  ) {
    setPlayerData({
      ...playerData,
      [field]: event.target.value,
    });
  }

  function calculateAge(birthDate: string): number {
    const today = new Date();
    const birthDateObject = new Date(birthDate);
    let age = today.getFullYear() - birthDateObject.getFullYear();
    const month = today.getMonth() - birthDateObject.getMonth();
    if (
      month < 0 ||
      (month === 0 && today.getDate() < birthDateObject.getDate())
    ) {
      age--;
    }
    return age;
  }

  async function uploadImage(): Promise<string | null> {
    if (croppedImage) {
      try {
        const fileExtension = croppedImage.split(";")[0].split("/")[1];
        const fileName = `avatar_${new Date().getTime()}.${fileExtension}`;
        const storageRef = ref(storage, `avatars/${fileName}`);
        const response = await fetch(croppedImage);
        const blob = await response.blob();

        await uploadBytesResumable(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        console.log("URL da imagem:", downloadURL);
        return downloadURL;
      } catch (error) {
        console.error("Erro ao enviar a imagem:", error);
        return null;
      }
    }
    return null;
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
      console.error("Objeto de referência não encontrado");
      return;
    }

    try {
      const newData = { ...data, modality: reference };
      const docRef = await addDoc(collection(db, collectionName), newData);
      console.log("Documento criado com sucesso. ID:", docRef.id);
      toast.success("Jogador cadastrado com sucesso!");
      router.push("newPlayer?mdl=" + modality.id);
    } catch (e) {
      console.error("Erro ao criar o documento:", e);
      toast.error("Erro ao cadastrar o Jogador!");
    }
  }

  async function handleSubmit() {
    setIsLoading(true);

    console.log(isLoading);
    let photoURL = null;
    if (croppedImage) {
      photoURL = await uploadImage();
    }

    console.log("photoURL");
    console.log(photoURL);

    const referenceCollectionName = "modalities";
    const referenceId = data.id;

    const playerDataWithPhoto = { ...playerData, photo: photoURL };

    await addNewDocumentWithReference(
      db,
      "players",
      playerDataWithPhoto,
      referenceCollectionName,
      referenceId
    );

    resetForm();
    setIsLoading(false);
  }

  return (
    <>
      <HomeButton></HomeButton>

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
            <label onClick={handleImageClick} className={styles.playerAvatar}>
              <p className={styles.label}>Foto do Jogador</p>
              <img
                className={styles.playerAvatar}
                src={croppedImage ? croppedImage : "./assets/avatar.jpg"}
                alt="Avatar"
              />
            </label>

            <input
              type="file"
              value=""
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Jogador</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.name}
              onChange={(e) => handleInputChange(e, "name")}
            />
          </div>

          {/* <div className={styles.form}>
            <p className={styles.label}>Foto do Jogador</p>
            <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"

            />

          </div> */}

          <div className={styles.form}>
            <p className={styles.label}>Posição</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.position}
              onChange={(e) => handleInputChange(e, "position")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Data de Nascimento</p>
            <input
              className={styles.field}
              type="date"
              value={playerData.birthDate}
              onChange={(e) => handleInputChange(e, "birthDate")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>CPF</p>
            <InputMask
              className={styles.field}
              mask="999.999.999-99"
              maskChar={null}
              value={playerData.cpf}
              onChange={(e) => handleInputChange(e, "cpf")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação total</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.totalScore.toString()}
              onChange={(e) => handleInputChange(e, "totalScore")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Bolas de três</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.threePointers.toString()}
              onChange={(e) => handleInputChange(e, "threePointers")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVPs partida</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.mpvOfTheGames.toString()}
              onChange={(e) => handleInputChange(e, "mpvOfTheGames")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Rei(a) dos Três Jogadores</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.kingplayer.toString()}
              onChange={(e) => handleInputChange(e, "kingplayer")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVPs campeonato</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.mvpOfTheChampionship.toString()}
              onChange={(e) => handleInputChange(e, "mvpOfTheChampionship")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas partida</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.topScorersOfTheGame.toString()}
              onChange={(e) => handleInputChange(e, "topScorersOfTheGame")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas campeonato</p>
            <input
              className={styles.field}
              type="number"
              value={playerData.topScorersOfTheChampionship.toString()}
              onChange={(e) =>
                handleInputChange(e, "topScorersOfTheChampionship")
              }
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Instagram</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.instagram}
              onChange={(e) => handleInputChange(e, "instagram")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Time</p>
            <SearchSelectTeam
              onSelectItem={(team: any) => {
                const updatedPlayerData = { ...playerData };
                updatedPlayerData.team = team.name;
                updatedPlayerData.teamLogo = team.logo;
                setPlayerData(updatedPlayerData);
              }}
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

        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
      {isLoading && <Spinner></Spinner>}

      <CustomModal
        open={modalOpen}
        handleClose={handleClose}
        handleSave={handleSave}
        content={
          <div>
            {image && (
              <div>
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={90}
                  height={90}
                  border={50}
                  borderRadius={50} // Adicione esta linha para tornar o recorte redondo
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={1.2}
                />
                <button onClick={handleSave}>Cortar Imagem</button>
              </div>
            )}
          </div>
        }
      />
    </>
  );
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
