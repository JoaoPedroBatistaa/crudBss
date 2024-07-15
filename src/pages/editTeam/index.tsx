import SearchSelect from "@/components/SearchSelect";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "firebase/storage";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Player {
  id: string;
  name: string;
  photo: string;
}

interface Params {
  id: string;
}

interface TeamData {
  logo: string | File | null;
  modality: string;
  name: string;
  whatsapp: string;
  cnpj: string;
  instagram: string;
  responsibleCpf: string;
  responsibleName: string;
  informations: string;
  squad: Player[];
  teamCategory: string;
  city: string;
  trainingLocation: string;
  foundationYear: string;
  titles: string[];
  participations: string[];
  categories: string[];
}

const initialState: TeamData = {
  logo: null,
  modality: "",
  name: "",
  whatsapp: "",
  cnpj: "",
  instagram: "",
  responsibleCpf: "",
  responsibleName: "",
  informations: "",
  squad: [{ id: "", name: "", photo: "" }],
  teamCategory: "",
  city: "",
  trainingLocation: "",
  foundationYear: "",
  titles: [""],
  participations: [""],
  categories: [""],
};

export async function getServerSideProps() {
  try {
    const teams = await fetchTeam();
    return { props: { teams: teams || null } };
  } catch (error) {
    console.error("Error fetching teams: ", error);
    return { props: { teams: null } };
  }
}

async function fetchTeam() {
  const response = await fetch("teams");
  const teams = await response.json();
  return teams;
}

export default function EditTeam({ teams }: { teams: TeamData[] }) {
  const router = useRouter();
  const { id } = router.query as unknown as Params;
  const [teamData, setTeamData] = useState<TeamData>(initialState);
  const [categories, setCategories] = useState([""]);

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setTeamData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file =
      event.target.files && event.target.files.length > 0
        ? event.target.files[0]
        : null;
    setTeamData((prevState) => ({ ...prevState, logo: file }));
  };

  const handleSelectItems = (selectedItem: Player, playerIndex: number) => {
    const updatedPlayers = [...teamData.squad];
    updatedPlayers[playerIndex] = selectedItem;
    setTeamData({ ...teamData, squad: updatedPlayers });
  };

  const addPlayer = () => {
    setTeamData((prevState) => ({
      ...prevState,
      squad: [...prevState.squad, { id: "", name: "", photo: "" }],
    }));
  };

  const addTitle = () => {
    setTeamData((prevState) => ({
      ...prevState,
      titles: [...prevState.titles, ""],
    }));
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedTitles = [...teamData.titles];
    updatedTitles[index] = value;
    setTeamData((prevState) => ({ ...prevState, titles: updatedTitles }));
  };

  const addParticipation = () => {
    setTeamData((prevState) => ({
      ...prevState,
      participations: [...prevState.participations, ""],
    }));
  };

  const handleParticipationChange = (index: number, value: string) => {
    const updatedParticipations = [...teamData.participations];
    updatedParticipations[index] = value;
    setTeamData((prevState) => ({
      ...prevState,
      participations: updatedParticipations,
    }));
  };

  const addCategory = () => {
    setCategories([...categories, ""]);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = value;
    setCategories(updatedCategories);
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!id) {
        console.log("Team ID is not defined.");
        return;
      }

      try {
        const teamDoc = await getDoc(doc(db, "teams", id));
        if (teamDoc.exists()) {
          const team = teamDoc.data() as TeamData;
          setTeamData(team);
          setCategories(team.categories || [""]);
        } else {
          console.log("No team exists with this ID.");
        }
      } catch (error) {
        console.error("Error fetching team details: ", error);
      }
    };

    if (router.isReady) {
      fetchTeamData();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error("Error: Team ID is not defined");
      toast.error("Error when updating team.");
      return;
    }

    try {
      if (teamData.logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `teams/${teamData.logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, teamData.logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        teamData.logo = downloadURL;
      }

      const updatedTeamData = {
        ...teamData,
        categories: categories,
      };

      await setDoc(doc(db, "teams", id), updatedTeamData);

      toast.success("Team updated successfully!");
    } catch (error) {
      console.error("Error when updating team: ", error);
      toast.error("Error when updating team.");
    }
  };

  function handleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Editar Time</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Time</p>
              <input
                className={styles.field}
                type="text"
                name="name"
                value={teamData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                name="logo"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Instagram do Time:</p>
              <input
                className={styles.field}
                type="text"
                name="instagram"
                value={teamData.instagram}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Categoria do Time:</p>
              <input
                className={styles.field}
                type="text"
                name="teamCategory"
                value={teamData.teamCategory}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Curiosidades</p>
              <textarea
                className={styles.field}
                name="informations"
                value={teamData.informations}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>CNPJ do time</p>
              <input
                className={styles.field}
                type="text"
                name="cnpj"
                value={teamData.cnpj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Nome Responsável</p>
              <input
                className={styles.field}
                type="text"
                name="responsibleName"
                value={teamData.responsibleName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>CPF Responsável</p>
              <input
                className={styles.field}
                type="text"
                name="responsibleCpf"
                value={teamData.responsibleCpf}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>WhatsApp Responsável:</p>
              <input
                className={styles.field}
                type="text"
                name="whatsapp"
                value={teamData.whatsapp}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Cidade do Time:</p>
              <input
                className={styles.field}
                type="text"
                name="city"
                value={teamData.city}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Onde Treina:</p>
              <input
                className={styles.field}
                type="text"
                name="trainingLocation"
                value={teamData.trainingLocation}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Ano de Fundação:</p>
              <input
                className={styles.field}
                type="text"
                name="foundationYear"
                value={teamData.foundationYear}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Títulos:</p>
              {teamData.titles.map((title, index) => (
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

            <div className={styles.form}>
              <p className={styles.label}>Participações em Campeonatos:</p>
              {teamData.participations.map((participation, index) => (
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
              <p className={styles.label}>Categorias:</p>
              {categories.map((category, index) => (
                <input
                  key={index}
                  className={styles.field}
                  type="text"
                  value={category}
                  onChange={(event) =>
                    handleCategoryChange(index, event.target.value)
                  }
                />
              ))}
              <button
                type="button"
                onClick={addCategory}
                className={styles.newPlayer}
              >
                Adicionar Nova Categoria
              </button>
            </div>

            <p className={styles.group}>Elenco</p>
            {teamData.squad.map((player, playerIndex) => (
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
              <button type="submit" className={styles.save}>
                SALVAR
              </button>
            </div>
          </form>
        </div>

        <button className={styles.back} onClick={handleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
