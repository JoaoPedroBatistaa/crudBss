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

interface TeamData {
  name: string;
  logo: null | File | string;
  instagram: string;
  informations: string;
  whatsapp: string;
  cnpj: string;
  responsibleCpf: string;
  responsibleName: string;
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  photo: string;
}

interface Params {
  id: string;
}

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
  // Implemente o código para buscar os dados dos times no banco de dados
  // e retorne os times obtidos
  const response = await fetch("teams"); // Substitua 'api/teams' pela rota correta em seu projeto
  const teams = await response.json();
  return teams;
}

export default function EditTeam({ teams }: { teams: TeamData[] }) {
  const router = useRouter();
  const { id } = router.query as unknown as Params;
  const [selectedItems, setSelectedItems] = useState<Player[]>([]);

  const [teamData, setTeamData] = useState<TeamData>({
    name: "",
    logo: null,
    instagram: "",
    informations: "",
    whatsapp: "",
    cnpj: "",
    responsibleCpf: "",
    responsibleName: "",
    players: [],
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSelectItems = (items: Player[]) => {
    setSelectedItems(items);
  };

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

      await setDoc(doc(db, "teams", id), teamData);

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
              <p className={styles.label}>Informações</p>
              <input
                className={styles.field}
                type="text"
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
              <p className={styles.label}>Elenco</p>
              <SearchSelect onSelectItems={handleSelectItems} />
            </div>

            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>
        </div>

        <button className={styles.back} onClick={handleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
