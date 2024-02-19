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

interface Category {
  categoryName: string;
  players: Player[];
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
  categories: Category[];
}

const initialState: TeamData = {
  logo: null, // Ajuste conforme necessário, por exemplo, se você espera uma string, ajuste para uma URL padrão ou mantenha como null e trate na lógica de upload
  modality: "", // Inicialize como uma string vazia ou com um valor padrão, se aplicável
  name: "",
  whatsapp: "",
  cnpj: "",
  instagram: "",
  responsibleCpf: "",
  responsibleName: "",
  informations: "",
  categories: [
    // Inicialize com uma categoria vazia que pode ser preenchida pelo usuário
    {
      categoryName: "",
      players: [
        {
          // Inicialize com um jogador vazio se a intenção é permitir ao usuário adicionar jogadores diretamente
          id: "", // O ID pode ser preenchido quando um novo jogador é adicionado
          name: "",
          photo: "",
        },
      ],
    },
  ],
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
  const [teamData, setTeamData] = useState<TeamData>(initialState);

  const handleCategoryNameChange = (
    event: ChangeEvent<HTMLInputElement>,
    categoryIndex: number
  ) => {
    const updatedCategories = [...teamData.categories]; // Faz uma cópia do estado atual das categorias
    updatedCategories[categoryIndex].categoryName = event.target.value; // Atualiza o nome da categoria com o valor do input

    setTeamData({ ...teamData, categories: updatedCategories }); // Atualiza o estado com as novas categorias
  };

  const addCategory = () => {
    const newCategory = {
      categoryName: "",
      players: [{ id: "", name: "", photo: "" }], // Adiciona um jogador por padrão à nova categoria, se necessário
    };
    setTeamData((prevState) => ({
      ...prevState,
      categories: [...prevState.categories, newCategory],
    }));
  };

  const addPlayer = (categoryIndex: any) => {
    const newPlayer = { id: "", name: "", photo: "" };
    const updatedCategories = [...teamData.categories];
    updatedCategories[categoryIndex].players.push(newPlayer);

    setTeamData({ ...teamData, categories: updatedCategories });
  };

  const handleSelectItems = (
    selectedItem: Player,
    categoryIndex: string | number,
    playerIndex: string | number
  ) => {
    // Converte os índices para o tipo number
    const catIndex = Number(categoryIndex);
    const playIndex = Number(playerIndex);

    // Lógica para atualizar o jogador selecionado dentro de uma categoria específica
    // Isso irá substituir o placeholder de novo jogador pelo jogador real selecionado
    const updatedCategories = [...teamData.categories];
    if (
      updatedCategories[catIndex] &&
      updatedCategories[catIndex].players[playIndex]
    ) {
      updatedCategories[catIndex].players[playIndex] = selectedItem;
      setTeamData({ ...teamData, categories: updatedCategories });
    }
  };

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

            {teamData.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className={styles.form}>
                <div className={styles.form}>
                  <p className={styles.label}>Nome da categoria</p>
                  <input
                    type="text"
                    className={styles.field}
                    value={category.categoryName}
                    onChange={(e) => handleCategoryNameChange(e, categoryIndex)}
                    placeholder="Nome da Categoria"
                  />
                </div>

                {category.players.map((player, playerIndex) => (
                  <div key={playerIndex} className={styles.tableItem}>
                    <p className={styles.label}>Nome do jogador</p>
                    <SearchSelect
                      onSelectItems={(items) =>
                        handleSelectItems(items[0], categoryIndex, playerIndex)
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() => addPlayer(categoryIndex)}
                  className={styles.newPlayer}
                  type="button" // Adiciona isso para evitar que o botão submeta o formulário
                >
                  Adicionar Novo Jogador
                </button>
              </div>
            ))}

            <div className={styles.buttons}>
              <button
                onClick={addCategory}
                className={styles.newPlayer}
                type="button"
              >
                Adicionar Nova Categoria
              </button>

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
