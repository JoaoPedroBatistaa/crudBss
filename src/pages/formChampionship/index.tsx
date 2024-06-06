import PhotoUpload from "@/components/PhotoUpload";
import Spinner from "@/components/Spinner";
import { addDoc, collection, db, doc, storage } from "@/firebase";
import {
  DocumentData,
  Firestore,
  getDoc,
  updateDoc,
} from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { GetServerSidePropsContext } from "next";
import router from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import SearchSelectTeam from "@/components/SearchSelectTable";
import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}
interface ChampionShip {
  id: string;
  name: string;
  logo: string | null;
  criterion: string;
  description: string;
  dataMatrix: TableData[]; // Usado para "todosContraTodos"
  groups?: { groupName: string; count: number; dataMatrix: TableData[] }[]; // Opcional, usado para "grupo"
  mataMataData?: {
    faseName: string;
    partidas: { timeA: string; logoA: string; timeB: string; logoB: string }[];
  }[]; // Opcional, usado para "mataMata"
  count: number;
  championshipType?: string; // Inclua também o tipo de campeonato
}

interface Item {
  id: string;
  name: string;
  logo: string;
}

type TableData = {
  time: string;
  position: string;
  victories: string;
  logo: string;
  jogos: string;
  derrotas: string;
  saldo: string;
  pontos: string; // Adicione esta linha
};

export default function NewFormChampionship({
  modalityForm,
}: {
  modalityForm: Modality;
}) {
  function HandleBackButtonClick() {
    window.history.back();
  }

  const [championShipData, setChampionShipData] = useState<ChampionShip>({
    id: "",
    name: "",
    logo: null,
    criterion: "",
    description: "",
    dataMatrix: [],
    count: 0,
  });

  const [championshipType, setChampionshipType] = useState("todosContraTodos");
  const [groupName, setGroupName] = useState("");

  const [groups, setGroups] = useState<
    { groupName: string; count: number; dataMatrix: TableData[] }[]
  >([{ groupName: "", count: 0, dataMatrix: [] }]);

  const addNewGroup = () => {
    setGroups([...groups, { groupName: "", count: 0, dataMatrix: [] }]);
  };

  const [mataMataData, setMataMataData] = useState([
    {
      faseName: "",
      partidas: [{ timeA: "", logoA: "", timeB: "", logoB: "" }],
    },
    // ...outras fases conforme necessário
  ]);

  const addPartida = (faseIndex: any) => {
    const newMataMataData = [...mataMataData];
    newMataMataData[faseIndex].partidas.push({
      timeA: "",
      logoA: "",
      timeB: "",
      logoB: "",
    });
    setMataMataData(newMataMataData);
  };

  const addFase = () => {
    setMataMataData([
      ...mataMataData,
      {
        faseName: "",
        partidas: [{ timeA: "", logoA: "", timeB: "", logoB: "" }],
      },
    ]);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);

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

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof ChampionShip
  ) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }

  function handleSelectChange(
    event: React.ChangeEvent<HTMLSelectElement>,
    field: keyof ChampionShip
  ) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }

  function handleTextAreaChange(
    event: React.ChangeEvent<HTMLTextAreaElement>,
    field: keyof ChampionShip
  ) {
    setChampionShipData({
      ...championShipData,
      [field]: event.target.value,
    });
  }

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };

  const [count, setCount] = useState(0);
  const [dataMatrix, setDataMatrix] = useState<TableData[]>([]);

  // Quando count é atualizado:
  const handleInputTableChange = (e: { target: HTMLInputElement }) => {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      setCount(value);
      setChampionShipData((prev) => ({ ...prev, count: value })); // Adicione essa linha
    }
  };

  // Quando dataMatrix é atualizado:
  const handleTableInputChange = (
    index: number,
    type: keyof TableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedMatrix = [...dataMatrix];
    if (!updatedMatrix[index]) {
      updatedMatrix[index] = {
        time: "",
        position: "",
        victories: "",
        logo: "",
        saldo: "",
        derrotas: "",
        pontos: "",
        jogos: "",
      };
    }
    updatedMatrix[index][type] = e.target.value;
    setDataMatrix(updatedMatrix);
    setChampionShipData((prev) => ({ ...prev, dataMatrix: updatedMatrix })); // Adicione essa linha
  };

  const handleGroupInputChange = (
    groupIndex: number,
    rowIndex: number,
    type: keyof TableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newGroups = [...groups];

    if (!newGroups[groupIndex]) {
      newGroups[groupIndex] = { groupName: "", count: 0, dataMatrix: [] };
    }

    const updatedMatrix = [...newGroups[groupIndex].dataMatrix];

    if (!updatedMatrix[rowIndex]) {
      updatedMatrix[rowIndex] = {
        time: "",
        position: "",
        victories: "",
        logo: "",
        saldo: "",
        derrotas: "",
        pontos: "",
        jogos: "",
      };
    }

    updatedMatrix[rowIndex][type] = e.target.value;
    newGroups[groupIndex].dataMatrix = updatedMatrix;
    setGroups(newGroups);
  };

  console.log(dataMatrix);

  const handleSubmit = async () => {
    setIsLoading(true);

    let imageUrl = "";
    if (selectedFile) {
      const storageRef = ref(storage, `championships/${selectedFile.name}`);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(fileSnapshot.ref);
    }

    let dataToSave: ChampionShip = {
      ...championShipData,
      logo: imageUrl,
      championshipType: championshipType,
    };

    if (championshipType === "todosContraTodos") {
      dataToSave.dataMatrix = dataMatrix;
    } else if (championshipType === "grupo") {
      dataToSave.groups = groups;
    } else if (championshipType === "mataMata") {
      dataToSave.mataMataData = mataMataData;
    }

    await addNewDocumentWithReference(
      db,
      "championships",
      dataToSave,
      "modalities",
      modalityForm.id
    );

    resetForm();
    setIsLoading(false);
  };

  function resetForm() {
    setChampionShipData({
      id: "",
      logo: "",
      name: "",
      criterion: "",
      description: "",
      dataMatrix: [],
      count: 0,
    });

    setPreviewImage(null);
    setSelectedFile(null);
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
      console.error("Objeto de referência não encontrado");
      return;
    }

    try {
      const newData = { ...data, modality: reference };
      const docRef = await addDoc(collection(db, collectionName), newData);

      // Adicionar ID ao documento e atualizar
      const updatedData = { ...newData, id: docRef.id };
      await updateDoc(docRef, updatedData);

      console.log("Documento criado com sucesso. ID:", docRef.id);
      toast.success("Campeonato criado com sucesso!");
      router.push("newChampionship?mdl=" + modalityForm.id);
    } catch (e) {
      console.error("Erro ao criar o documento:", e);
      toast.error("Erro ao cadastrar o campeonato!");
    }
  }

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <HomeButton></HomeButton>

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
                <img
                  className={styles.previewImage}
                  src={previewImage}
                  alt="Preview"
                />
              </div>
            )}
            <p className={styles.label}>Logo do campeonato</p>
            <div className={styles.fieldFile}>
              <PhotoUpload onChange={handleFileChange} />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Campeonato</p>
            <input
              className={styles.field}
              type="text"
              onChange={(e) => handleInputChange(e, "name")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Critério do Campeonato</p>
            <select
              className={styles.field}
              onChange={(e) => handleSelectChange(e, "criterion")}
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
              onChange={(e) => handleTextAreaChange(e, "description")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Tipo de Classificação</p>
            <select
              id="championshipType"
              className={styles.field}
              onChange={(e) => setChampionshipType(e.target.value)}
            >
              <option value="todosContraTodos">Todos contra todos</option>
              <option value="grupo">Grupo</option>
              <option value="mataMata">Mata Mata</option>
            </select>
          </div>

          {championshipType === "todosContraTodos" && (
            <div className={styles.form}>
              <div className={styles.headTable}>
                <p className={styles.label}>
                  Tabela do Campeonato - insira o Nº posições
                </p>
                <input
                  type="text"
                  id="positions"
                  className={styles.pos}
                  pattern="\d*"
                  onInput={(e) => {
                    const input = e.currentTarget as HTMLInputElement;
                    const value = parseInt(input.value);
                    if (!isNaN(value)) {
                      setCount(value);
                    }
                  }}
                />
              </div>

              {/* Aqui começamos a renderização condicional */}
              {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.table}>
                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>P</p>
                    <input
                      type="number"
                      className={styles.positionL}
                      pattern="\d*"
                      value={dataMatrix[index]?.position || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "position", e)
                      }
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>Time</p>
                    <SearchSelectTeam
                      onSelectItem={(team: Item) => {
                        const updatedMatrix = [...dataMatrix];
                        if (!updatedMatrix[index]) {
                          updatedMatrix[index] = {
                            time: "",
                            position: "",
                            victories: "",
                            logo: "",
                            saldo: "",
                            derrotas: "",
                            pontos: "",
                            jogos: "",
                          };
                        }
                        updatedMatrix[index].time = team.name;
                        updatedMatrix[index].logo = team.logo; // Adicione esta linha para salvar o logo
                        // supondo que você queira salvar o nome do time
                        setDataMatrix(updatedMatrix);
                      }}
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>Pts</p>
                    <input
                      type="number"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.pontos || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "pontos", e)
                      }
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>V</p>
                    <input
                      type="number"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.victories || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "victories", e)
                      }
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>D</p>
                    <input
                      type="number"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.derrotas || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "derrotas", e)
                      }
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>S</p>
                    <input
                      type="number"
                      className={styles.position}
                      pattern="\d*"
                      value={dataMatrix[index]?.saldo || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "saldo", e)
                      }
                    />
                  </div>

                  <div className={styles.tableItem}>
                    <p className={styles.tableLabel}>J</p>
                    <input
                      type="number"
                      className={styles.positionD}
                      pattern="\d*"
                      value={dataMatrix[index]?.jogos || ""}
                      onChange={(e) =>
                        handleTableInputChange(index, "jogos", e)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {championshipType === "grupo" && (
            <>
              {groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className={styles.form}>
                    <p className={styles.label}>Nome do Grupo</p>
                    <input
                      type="text"
                      className={styles.field}
                      value={group.groupName}
                      onChange={(e) => {
                        const newGroups = [...groups];
                        newGroups[groupIndex].groupName = e.target.value;
                        setGroups(newGroups);
                      }}
                    />
                  </div>

                  <div className={styles.headTable}>
                    <p className={styles.label}>
                      Tabela do Grupo - insira o Nº posições
                    </p>
                    <input
                      type="text"
                      className={styles.pos}
                      pattern="\d*"
                      onInput={(e) => {
                        const value = parseInt(e.currentTarget.value);
                        if (!isNaN(value)) {
                          const newGroups = [...groups];
                          newGroups[groupIndex].count = value;
                          setGroups(newGroups);
                        }
                      }}
                    />
                  </div>

                  {Array.from({ length: group.count }).map((_, rowIndex) => (
                    <div key={rowIndex} className={styles.table}>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>P</p>
                        <input
                          type="number"
                          className={styles.positionL}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.position || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "position",
                              e
                            )
                          }
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>Time</p>
                        <SearchSelectTeam
                          onSelectItem={(team: Item) => {
                            const newGroups = [...groups];
                            if (!newGroups[groupIndex].dataMatrix[rowIndex]) {
                              newGroups[groupIndex].dataMatrix[rowIndex] = {
                                time: "",
                                position: "",
                                victories: "",
                                logo: "",
                                saldo: "",
                                derrotas: "",
                                pontos: "",
                                jogos: "",
                              };
                            }
                            newGroups[groupIndex].dataMatrix[rowIndex].time =
                              team.name;
                            newGroups[groupIndex].dataMatrix[rowIndex].logo =
                              team.logo;
                            setGroups(newGroups);
                          }}
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>Pts</p>
                        <input
                          type="number"
                          className={styles.position}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.pontos || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "pontos",
                              e
                            )
                          }
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>V</p>
                        <input
                          type="number"
                          className={styles.position}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.victories || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "victories",
                              e
                            )
                          }
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>D</p>
                        <input
                          type="number"
                          className={styles.position}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.derrotas || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "derrotas",
                              e
                            )
                          }
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>S</p>
                        <input
                          type="number"
                          className={styles.position}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.saldo || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "saldo",
                              e
                            )
                          }
                        />
                      </div>

                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>J</p>
                        <input
                          type="number"
                          className={styles.positionD}
                          pattern="\d*"
                          value={group.dataMatrix[rowIndex]?.jogos || ""}
                          onChange={(e) =>
                            handleGroupInputChange(
                              groupIndex,
                              rowIndex,
                              "jogos",
                              e
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <button onClick={addNewGroup} className={styles.newPlayer}>
                Adicionar Novo Grupo
              </button>
            </>
          )}
          {championshipType === "mataMata" && (
            <>
              {mataMataData.map((fase, faseIndex) => (
                <div key={faseIndex}>
                  <div className={styles.form}>
                    <p className={styles.label}>Nome da fase</p>
                    <input
                      type="text"
                      className={styles.field}
                      value={fase.faseName}
                      onChange={(e) => {
                        const newMataMataData = [...mataMataData];
                        newMataMataData[faseIndex].faseName = e.target.value;
                        setMataMataData(newMataMataData);
                      }}
                      placeholder="Nome da Fase"
                    />
                  </div>

                  {fase.partidas.map((partida, partidaIndex) => (
                    <div key={partidaIndex}>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>Time A</p>
                        <SearchSelectTeam
                          onSelectItem={(team: Item) => {
                            const newMataMataData = [...mataMataData];
                            if (
                              !newMataMataData[faseIndex].partidas[partidaIndex]
                            ) {
                              newMataMataData[faseIndex].partidas[
                                partidaIndex
                              ] = {
                                timeA: "",
                                logoA: "",
                                timeB: "",
                                logoB: "",
                              };
                            }
                            newMataMataData[faseIndex].partidas[
                              partidaIndex
                            ].timeA = team.name;
                            newMataMataData[faseIndex].partidas[
                              partidaIndex
                            ].logoA = team.logo;
                            setMataMataData(newMataMataData);
                          }}
                        />
                      </div>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>Time B</p>
                        <SearchSelectTeam
                          onSelectItem={(team: Item) => {
                            const newMataMataData = [...mataMataData];
                            if (
                              !newMataMataData[faseIndex].partidas[partidaIndex]
                            ) {
                              newMataMataData[faseIndex].partidas[
                                partidaIndex
                              ] = {
                                timeA: "",
                                logoA: "",
                                timeB: "",
                                logoB: "",
                              };
                            }
                            newMataMataData[faseIndex].partidas[
                              partidaIndex
                            ].timeB = team.name;
                            newMataMataData[faseIndex].partidas[
                              partidaIndex
                            ].logoB = team.logo;
                            setMataMataData(newMataMataData);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addPartida(faseIndex)}
                    className={styles.newPlayer}
                  >
                    Adicionar Partida
                  </button>
                </div>
              ))}

              <button onClick={addFase} className={styles.newPlayer}>
                Adicionar Fase
              </button>
            </>
          )}
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
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { mdl } = query;
  console.log(mdl);

  return {
    props: {
      modalityForm: { id: mdl },
    },
  };
}
