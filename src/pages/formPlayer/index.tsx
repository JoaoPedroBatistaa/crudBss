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

interface Team {
  name: string;
}

interface Player {
  instagram?: string;
  name: string;
  photo?: string;
  position: string;
  cpf: string;
  birthDate: string;
  team?: string;
  teamLogo?: string;
  about: string;
  curiosities?: string[];
  destaquePartida?: string;
  pontuacaoGeral?: string;
  cestinhaPartida?: string;
  cestinhaCampeonato?: string;
  bolasTresGeral?: string;
  reiTresCampeonato?: string;
  selecaoCampeonato?: string;
  destaqueCampeonato?: string;
  teams?: Team[];
}

export default function FormPlayer({ data }: { data: Modality }) {
  const [modality, setModality] = useState(data);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileInputOpen, setIsFileInputOpen] = useState(false);
  const router = useRouter();
  const [playerData, setPlayerData] = useState<Player>({
    name: "",
    position: "",
    instagram: "",
    cpf: "",
    birthDate: "",
    about: "",
    curiosities: [],
    destaquePartida: "",
    pontuacaoGeral: "",
    cestinhaPartida: "",
    cestinhaCampeonato: "",
    bolasTresGeral: "",
    reiTresCampeonato: "",
    selecaoCampeonato: "",
    destaqueCampeonato: "",
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState("");
  const [newCuriosity, setNewCuriosity] = useState("");
  const editorRef = useRef<AvatarEditor | null>(null);

  const handleImageClick = () => {
    if (!isFileInputOpen) {
      setIsFileInputOpen(true);
      fileInputRef.current?.click();
    }
  };

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

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const addTeam = (team: Team) => {
    setTeams((prevTeams) => [...prevTeams, team]);
  };

  const removeTeam = (index: number) => {
    setTeams((prevTeams) => prevTeams.filter((_, i) => i !== index));
  };

  const addCuriosity = () => {
    if (newCuriosity.trim()) {
      setPlayerData((prevData) => ({
        ...prevData,
        curiosities: [...(prevData.curiosities || []), newCuriosity],
      }));
      setNewCuriosity("");
    }
  };

  const removeCuriosity = (index: number) => {
    setPlayerData((prevData) => ({
      ...prevData,
      curiosities: (prevData.curiosities || []).filter((_, i) => i !== index),
    }));
  };

  function resetForm() {
    setPlayerData({
      name: "",
      position: "",
      instagram: "",
      cpf: "",
      birthDate: "",
      about: "",
      curiosities: [],
      destaquePartida: "",
      pontuacaoGeral: "",
      cestinhaPartida: "",
      cestinhaCampeonato: "",
      bolasTresGeral: "",
      reiTresCampeonato: "",
      selecaoCampeonato: "",
      destaqueCampeonato: "",
    });
    setCroppedImage("");
    setImage("");
    setTeams([]);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Player
  ) {
    setPlayerData({
      ...playerData,
      [field]: event.target.value,
    });
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
        return downloadURL;
      } catch (error) {
        console.error("Erro ao enviar a imagem:", error);
        return null;
      }
    }
    return null;
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
      toast.error("Modalidade não encontrada!");
      return;
    }

    try {
      const newData = { ...data, modality: reference };
      const docRef = await addDoc(collection(db, collectionName), newData);
      toast.success("Jogador cadastrado com sucesso!");
      router.push("newPlayer?mdl=" + modality.id);
    } catch (e) {
      console.error("Erro ao criar o documento:", e);
      toast.error("Erro ao cadastrar o Jogador!");
    }
  }

  async function handleSubmit() {
    setIsLoading(true);
    let photoURL = null;
    if (croppedImage) {
      photoURL = await uploadImage();
    }

    const referenceCollectionName = "modalities";
    const referenceId = data.id;

    const playerDataWithTeams = { ...playerData, photo: photoURL, teams };

    await addNewDocumentWithReference(
      db,
      "players",
      playerDataWithTeams,
      referenceCollectionName,
      referenceId
    );

    resetForm();
    setIsLoading(false);
  }

  return (
    <>
      <HomeButton />

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
                src={croppedImage || "./assets/avatar.jpg"}
                alt="Avatar"
              />
            </label>
            <input
              type="file"
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
            <p className={styles.label}>Sobre o jogador</p>
            <textarea
              className={styles.field}
              value={playerData.about}
              onChange={(e) => handleInputChange(e, "about")}
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
            <p className={styles.label}>Instagram</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.instagram}
              onChange={(e) => handleInputChange(e, "instagram")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Curiosidades</p>
            {playerData.curiosities?.map((curiosity, index) => (
              <div key={index} className={styles.teamItem}>
                <span className={styles.label}>{curiosity}</span>
                <button
                  type="button"
                  className={styles.save}
                  onClick={() => removeCuriosity(index)}
                >
                  Remover
                </button>
              </div>
            ))}
            <input
              className={styles.field}
              type="text"
              value={newCuriosity}
              onChange={(e) => setNewCuriosity(e.target.value)}
              placeholder="Adicione uma curiosidade"
            />
            <button className={styles.save} onClick={addCuriosity}>
              Adicionar Curiosidade
            </button>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Destaque da Partida</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.destaquePartida}
              onChange={(e) => handleInputChange(e, "destaquePartida")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação Geral</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.pontuacaoGeral}
              onChange={(e) => handleInputChange(e, "pontuacaoGeral")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinha da Partida</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.cestinhaPartida}
              onChange={(e) => handleInputChange(e, "cestinhaPartida")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinha Campeonato</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.cestinhaCampeonato}
              onChange={(e) => handleInputChange(e, "cestinhaCampeonato")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Bolas de 3 Geral</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.bolasTresGeral}
              onChange={(e) => handleInputChange(e, "bolasTresGeral")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Rei dos 3 Campeonato</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.reiTresCampeonato}
              onChange={(e) => handleInputChange(e, "reiTresCampeonato")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Seleção do Campeonato</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.selecaoCampeonato}
              onChange={(e) => handleInputChange(e, "selecaoCampeonato")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Destaque do Campeonato</p>
            <input
              className={styles.field}
              type="text"
              value={playerData.destaqueCampeonato}
              onChange={(e) => handleInputChange(e, "destaqueCampeonato")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Equipes</p>
            {teams.map((team, index) => (
              <div key={index} className={styles.teamItem}>
                <span className={styles.label}>{team.name}</span>
                <button
                  type="button"
                  className={styles.save}
                  onClick={() => removeTeam(index)}
                >
                  Remover
                </button>
              </div>
            ))}

            <SearchSelectTeam onSelectItem={(team: Team) => addTeam(team)} />
          </div>

          <button
            className={styles.save}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            SALVAR
          </button>
        </div>

        <button className={styles.back} onClick={() => window.history.back()}>
          Voltar
        </button>
      </div>

      {isLoading && <Spinner />}

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
                  borderRadius={50}
                  color={[255, 255, 255, 0.6]}
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

  return {
    props: {
      data: { id: mdl },
    },
  };
}
