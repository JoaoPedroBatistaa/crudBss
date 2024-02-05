import PhotoUpload from "@/components/PhotoUpload";
import SearchSelect from "@/components/SearchSelect";
import Spinner from "@/components/Spinner";
import { db } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface Item {
  id: string;
  name: string;
  photo: string;
}

interface Category {
  categoryName: string;
  players: Item[];
}

interface TeamData {
  categories: Category[];
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
}

const initialState = {
  categories: [
    {
      categoryName: "",
      players: [{ id: "", name: "", photo: "" }],
    },
  ],
};

export default function FormNewTime({ data }: { data: Modality }) {
  const [teamName, setTeamName] = useState("");
  const [teamCnpj, setTeamCnpj] = useState("");
  const [teamCpfResponsible, setTeamCpfResponsible] = useState("");
  const [teamNameResponsible, setTeamNameResponsible] = useState("");
  const [teamWhatsAppResponsible, setTeamWhatsAppResponsible] = useState("");
  const [teamInstagram, setTeamInstagram] = useState("");
  const [informations, setInformations] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limparSelected, setLimparSelected] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [placeholder, setPlaceholder] = useState("Pesquisar");
  const [teamData, setTeamData] = useState(initialState);

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
    selectedItem: Item,
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
      // Upload da imagem para o Firebase Storage (se necessário)
      let imageUrl = "";
      if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${selectedFile.name}`);
        const fileSnapshot = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
      }

      // Obter a referência da modalidade
      const modalityRef = doc(db, "modalities", data.id);

      // Preparando as categorias e seus jogadores para serem incluídos
      const categoriesWithPlayers = teamData.categories.map((category) => ({
        categoryName: category.categoryName,
        players: category.players.map((player) => ({
          id: player.id,
          name: player.name,
          photo: player.photo,
        })),
      }));

      // Criando o objeto do time com as referências, incluindo as categorias
      const newTeam = {
        logo: imageUrl,
        modality: modalityRef.path, // Usa a referência da modalidade
        name: teamName,
        whatsapp: teamWhatsAppResponsible,
        cnpj: teamCnpj,
        instagram: teamInstagram,
        responsibleCpf: teamCpfResponsible,
        responsibleName: teamNameResponsible,
        informations: informations,
        categories: categoriesWithPlayers, // Inclui as categorias com jogadores
        createdAt: serverTimestamp(),
      };

      // Adicionando o novo time à coleção 'teams'
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
    setSelectedFile(null);
    setPreviewImage(null);
    setSelectedItems([]);
    handleResetSearch();
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <>
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
              <p className={styles.label}>Informações</p>
              <textarea
                className={styles.field}
                value={teamInstagram}
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
              <div className={styles.uploadContainer}>
                <PhotoUpload onChange={handleFileChange} />
              </div>
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
                    <p className={styles.tableLabel}>Nome do jogador</p>
                    <SearchSelect
                      onSelectItems={(items) =>
                        handleSelectItems(items[0], categoryIndex, playerIndex)
                      }
                    />
                  </div>
                ))}

                <button
                  onClick={() => addPlayer(categoryIndex)}
                  className={styles.save}
                  type="button" // Adiciona isso para evitar que o botão submeta o formulário
                >
                  Adicionar Novo Jogador
                </button>
              </div>
            ))}

            <button onClick={addCategory} className={styles.save} type="button">
              Adicionar Nova Categoria
            </button>

            {/* <div className={styles.form}>
              <p className={styles.label}>Elenco</p>
              <SearchSelect onSelectItems={handleSelectItems} />
            </div> */}

            <button className={styles.save} type="submit" disabled={isLoading}>
              SALVAR
            </button>
          </form>

          <button className={styles.back} onClick={HandleBackButtonClick}>
            Voltar
          </button>
        </div>
      </div>
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
