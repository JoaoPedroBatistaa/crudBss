import PhotoUpload from "@/components/PhotoUpload";
import SearchSelect from "@/components/SearchSelect";
import Spinner from "@/components/Spinner";
import { db } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import Header from "@/components/Header";
import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface Item {
  id: string;
  name: string;
  photo: string;
}

interface Team {
  logo: string;
  modality: string;
  name: string;
  squad: Item[];
  cnpj: string;
  responsibleCpf: string;
  responsibleName: string;
  instagram: string;
  whatsapp: string;
  informations: string;
  teamCategory: string;
  createdAt: any;
  city: string;
  trainingLocation: string;
  foundationYear: string;
  titles: string[];
  participations: string[];
}

const initialState = {
  players: [{ id: "", name: "", photo: "" }],
  titles: [""],
  participations: [""],
};

export default function FormNewTime({ data }: { data: Modality }) {
  const [teamName, setTeamName] = useState("");
  const [teamCnpj, setTeamCnpj] = useState("");
  const [teamCpfResponsible, setTeamCpfResponsible] = useState("");
  const [teamNameResponsible, setTeamNameResponsible] = useState("");
  const [teamWhatsAppResponsible, setTeamWhatsAppResponsible] = useState("");
  const [teamInstagram, setTeamInstagram] = useState("");
  const [informations, setInformations] = useState("");
  const [teamCategory, setTeamCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limparSelected, setLimparSelected] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [placeholder, setPlaceholder] = useState("Pesquisar");
  const [city, setCity] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [foundationYear, setFoundationYear] = useState("");
  const [titles, setTitles] = useState([""]);
  const [participations, setParticipations] = useState([""]);
  const [teamData, setTeamData] = useState(initialState);

  const addPlayer = () => {
    setTeamData((prevState) => ({
      ...prevState,
      players: [...prevState.players, { id: "", name: "", photo: "" }],
    }));
  };

  const handleSelectItems = (selectedItem: Item, playerIndex: number) => {
    const updatedPlayers = [...teamData.players];
    updatedPlayers[playerIndex] = selectedItem;
    setTeamData({ ...teamData, players: updatedPlayers });
  };

  const addTitle = () => {
    setTitles([...titles, ""]);
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedTitles = [...titles];
    updatedTitles[index] = value;
    setTitles(updatedTitles);
  };

  const addParticipation = () => {
    setParticipations([...participations, ""]);
  };

  const handleParticipationChange = (index: number, value: string) => {
    const updatedParticipations = [...participations];
    updatedParticipations[index] = value;
    setParticipations(updatedParticipations);
  };

  const router = useRouter();

  useEffect(() => {
    resetForm();
  }, [data]);

  function HandleBackButtonClick() {
    router.back();
  }

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = "";
      if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${selectedFile.name}`);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
      }

      const modalityRef = doc(db, "modalities", data.id);

      const newTeam: Team = {
        logo: imageUrl,
        modality: modalityRef.path,
        name: teamName,
        whatsapp: teamWhatsAppResponsible,
        cnpj: teamCnpj,
        instagram: teamInstagram,
        responsibleCpf: teamCpfResponsible,
        responsibleName: teamNameResponsible,
        informations: informations,
        squad: teamData.players,
        teamCategory: teamCategory,
        createdAt: serverTimestamp(),
        city: city,
        trainingLocation: trainingLocation,
        foundationYear: foundationYear,
        titles: titles,
        participations: participations,
      };

      const docRef = await addDoc(collection(db, "teams"), newTeam);

      console.log("Time cadastrado com sucesso! ID:", docRef.id);
      toast.success("Time cadastrado com sucesso");

      setIsLoading(false);
      resetForm();
      router.push("newTeam?mdl=" + data.id);
    } catch (error) {
      console.error("Erro ao cadastrar o time:", error);
      toast.error("Erro ao cadastrar o time");
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchText("");
    setPlaceholder("Pesquisar");
  };

  const resetForm = () => {
    setTeamName("");
    setTeamCnpj("");
    setTeamCpfResponsible("");
    setTeamNameResponsible("");
    setTeamWhatsAppResponsible("");
    setTeamInstagram("");
    setInformations("");
    setTeamCategory("");
    setSelectedFile(null);
    setPreviewImage(null);
    setSelectedItems([]);
    setCity("");
    setTrainingLocation("");
    setFoundationYear("");
    setTitles([""]);
    setParticipations([""]);
    setTeamData(initialState);
    handleResetSearch();
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <Header></Header>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Times</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO TIME</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Time</p>
              <input
                className={styles.field}
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>CNPJ do time:</p>
              <InputMask
                mask="99.999.999/9999-99"
                className={styles.field}
                type="text"
                value={teamCnpj}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTeamCnpj(event.target.value)
                }
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Instagram do Time:</p>
              <input
                className={styles.field}
                type="text"
                value={teamInstagram}
                onChange={(event) => setTeamInstagram(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Categoria do Time:</p>
              <input
                className={styles.field}
                type="text"
                value={teamCategory}
                onChange={(event) => setTeamCategory(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Curiosidades</p>
              <textarea
                className={styles.field}
                value={informations}
                onChange={(event) => setInformations(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Nome Responsável:</p>
              <input
                className={styles.field}
                type="text"
                value={teamNameResponsible}
                onChange={(event) => setTeamNameResponsible(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>CPF Responsável:</p>
              <InputMask
                mask="999.999.999-99"
                className={styles.field}
                type="text"
                value={teamCpfResponsible}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTeamCpfResponsible(event.target.value)
                }
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>WhatsApp Responsável:</p>
              <InputMask
                mask="(99) 99999-9999"
                className={styles.field}
                type="text"
                value={teamWhatsAppResponsible}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTeamWhatsAppResponsible(event.target.value)
                }
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Cidade do Time:</p>
              <input
                className={styles.field}
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Onde Treina:</p>
              <input
                className={styles.field}
                type="text"
                value={trainingLocation}
                onChange={(event) => setTrainingLocation(event.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Ano de Fundação:</p>
              <input
                className={styles.field}
                type="text"
                value={foundationYear}
                onChange={(event) => setFoundationYear(event.target.value)}
              />
            </div>
            <div className={styles.formT}>
              <p className={styles.label}>Títulos:</p>
              {titles.map((title, index) => (
                <input
                  key={index}
                  className={styles.field}
                  type="text"
                  value={title}
                  onChange={(event) =>
                    handleTitleChange(index, event.target.value)
                  }
                />
              ))}
              <button
                type="button"
                onClick={addTitle}
                className={styles.newPlayer}
              >
                Adicionar Novo Título
              </button>
            </div>
            <div className={styles.formT}>
              <p className={styles.label}>Participações em Campeonatos:</p>
              {participations.map((participation, index) => (
                <input
                  key={index}
                  className={styles.field}
                  type="text"
                  value={participation}
                  onChange={(event) =>
                    handleParticipationChange(index, event.target.value)
                  }
                />
              ))}
              <button
                type="button"
                onClick={addParticipation}
                className={styles.newPlayer}
              >
                Adicionar Nova Participação
              </button>
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
              <p className={styles.label}>Logo</p>
              <div className={styles.fieldFile}>
                <PhotoUpload onChange={handleFileChange} />
              </div>
            </div>
            <p className={styles.group}>Elenco</p>
            {teamData.players.map((player, playerIndex) => (
              <div key={playerIndex} className={styles.tableItem}>
                <p className={styles.label}>Nome do jogador</p>
                <SearchSelect
                  onSelectItems={(items) =>
                    handleSelectItems(items[0], playerIndex)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addPlayer}
              className={styles.newPlayer}
            >
              Adicionar Novo Jogador
            </button>
            <div className={styles.buttons}>
              <button
                className={styles.save}
                type="submit"
                disabled={isLoading}
              >
                SALVAR
              </button>
            </div>
          </form>
        </div>
        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
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
