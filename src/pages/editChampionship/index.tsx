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
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import SearchSelectTeam from "@/components/SearchSelectTable";
import HomeButton from "../../components/HomeButton";

interface ChampionShip {
  id: string;
  name: string;
  logo: string | File | null;
  criterion: string;
  description: string;
  dataMatrix: TableData[]; // Usado para "todosContraTodos"
  groups?: { groupName: string; count: number; dataMatrix: TableData[] }[]; // Opcional, usado para "grupo"
  mataMataData?: {
    faseName: string;
    partidas: { timeA: string; timeB: string }[];
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

export default function EditChampionship() {
  const [championshipData, setChampionshipData] = useState<ChampionShip>({
    id: "",
    name: "",
    logo: null,
    criterion: "",
    description: "",
    dataMatrix: [],
    groups: [], // Inicialize grupos
    mataMataData: [], // Inicialize mataMataData
    count: 0,
    championshipType: "todosContraTodos", // Inicialize o tipo de campeonato
  });

  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);

  const router = useRouter();
  const { id } = router.query;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setChampionshipData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file =
      event.target.files && event.target.files.length > 0
        ? event.target.files[0]
        : null;
    setChampionshipData((prevState) => ({ ...prevState, logo: file }));
  };

  useEffect(() => {
    const fetchChampionship = async () => {
      if (!id) {
        console.log("Championship ID is not defined.");
        return;
      }

      try {
        const championshipDoc = await getDoc(
          doc(db, "championships", id as string)
        );
        if (championshipDoc.exists()) {
          const championship = championshipDoc.data() as ChampionShip;
          setChampionshipData(championship);
          setDataMatrix(championship.dataMatrix || []);
          setCount(championship.count || 0);
        } else {
          console.log("No championship exists with this ID.");
        }
      } catch (error) {
        console.error("Error fetching championship details: ", error);
      }
    };

    if (router.isReady) {
      fetchChampionship();
    }
  }, [router.isReady, id]);

  const handleClick = async () => {
    if (!id) {
      console.error("Error: Championship ID is not defined");
      toast.error("Erro ao atualizar o campeonato.");
      return;
    }

    try {
      let updatedChampionshipData = { ...championshipData, dataMatrix, count };

      if (updatedChampionshipData.logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(
          storage,
          `championships/${updatedChampionshipData.logo.name}`
        );

        const uploadTask = uploadBytesResumable(
          fileRef,
          updatedChampionshipData.logo
        );
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        updatedChampionshipData.logo = downloadURL as string;
      }

      await setDoc(
        doc(db, "championships", id as string),
        updatedChampionshipData
      );

      toast.success("Campeonato atualizado com sucesso!");
      // router.push("/newChampionship");
    } catch (error) {
      console.error("Erro ao atualizar o campeonato: ", error);
      toast.error("Erro ao atualizar o campeonato.");
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };

  const [count, setCount] = useState(0);
  const [dataMatrix, setDataMatrix] = useState<TableData[]>([]);

  const handleInputTableChange = (e: { target: HTMLInputElement }) => {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      setCount(value);
    }
  };

  const addNewGroup = () => {
    const updatedChampionshipData: ChampionShip = { ...championshipData };

    if (!updatedChampionshipData.groups) {
      updatedChampionshipData.groups = [];
    }

    updatedChampionshipData.groups.push({
      groupName: "",
      count: 0,
      dataMatrix: [],
    });

    setChampionshipData(updatedChampionshipData);
  };

  const handleGroupInputChange = (
    groupIndex: number,
    rowIndex: number,
    field: keyof TableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedChampionshipData: ChampionShip = { ...championshipData };

    if (
      updatedChampionshipData.groups &&
      updatedChampionshipData.groups[groupIndex]
    ) {
      if (!updatedChampionshipData.groups[groupIndex].dataMatrix) {
        updatedChampionshipData.groups[groupIndex].dataMatrix = [];
      }

      if (!updatedChampionshipData.groups[groupIndex].dataMatrix[rowIndex]) {
        updatedChampionshipData.groups[groupIndex].dataMatrix[rowIndex] = {
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

      updatedChampionshipData.groups[groupIndex].dataMatrix[rowIndex][field] =
        e.target.value;

      setChampionshipData(updatedChampionshipData);
    }
  };

  const addFase = () => {
    const newFase = {
      faseName: "",
      partidas: [],
    };

    setChampionshipData((prevState) => ({
      ...prevState,
      mataMataData: [...(prevState.mataMataData || []), newFase],
    }));
  };

  const addPartida = (faseIndex: any) => {
    const newPartida = {
      timeA: "",
      timeB: "",
    };

    setChampionshipData((prevState) => {
      const updatedMataMataData = [...(prevState.mataMataData || [])];
      if (updatedMataMataData[faseIndex]) {
        updatedMataMataData[faseIndex].partidas = [
          ...(updatedMataMataData[faseIndex].partidas || []),
          newPartida,
        ];
      }
      return {
        ...prevState,
        mataMataData: updatedMataMataData,
      };
    });
  };

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
  };

  console.log(dataMatrix);

  return (
    <>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Editar Campeonato</h1>
          </div>

          <form>
            <div className={styles.form}>
              <p className={styles.label}>Logo do Campeonato</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Nome do Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={championshipData.name}
                name="name"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Critério do Campeonato</p>
              <select
                className={styles.field}
                name="criterion"
                value={championshipData.criterion}
                onChange={handleSelectChange}
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
                value={championshipData.description}
                name="description"
                onChange={handleTextAreaChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Tipo de Classificação</p>
              <select
                id="championshipType"
                className={styles.field}
                value={championshipData.championshipType}
                onChange={(e) =>
                  setChampionshipData((prevState) => ({
                    ...prevState,
                    championshipType: e.target.value,
                  }))
                }
              >
                <option value="todosContraTodos">Todos contra todos</option>
                <option value="grupo">Grupo</option>
                <option value="mataMata">Mata Mata</option>
              </select>
            </div>

            {championshipData.championshipType === "todosContraTodos" && (
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

                {/* Renderização condicional para edição */}
                {Array.from({ length: count }).map((_, index) => (
                  <div key={index} className={styles.table}>
                    <div className={styles.tableItem}>
                      <p className={styles.tableLabel}>P</p>
                      <input
                        type="number"
                        className={styles.positionL}
                        pattern="\d*"
                        value={
                          championshipData.dataMatrix[index]?.position || ""
                        }
                        onChange={(e) =>
                          handleTableInputChange(index, "position", e)
                        }
                      />
                    </div>

                    <div className={styles.tableItem}>
                      <p className={styles.tableLabel}>
                        Time ({championshipData.dataMatrix[index]?.time || ""})
                      </p>
                      <SearchSelectTeam
                        onSelectItem={(team: Item) => {
                          const updatedMatrix = [
                            ...championshipData.dataMatrix,
                          ];
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
                          updatedMatrix[index].logo = team.logo; // Salva o logo
                          setChampionshipData((prevState) => ({
                            ...prevState,
                            dataMatrix: updatedMatrix,
                          }));
                        }}
                      />
                    </div>

                    <div className={styles.tableItem}>
                      <p className={styles.tableLabel}>Pts</p>
                      <input
                        type="number"
                        className={styles.position}
                        pattern="\d*"
                        value={championshipData.dataMatrix[index]?.pontos || ""}
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
                        value={
                          championshipData.dataMatrix[index]?.victories || ""
                        }
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
                        value={
                          championshipData.dataMatrix[index]?.derrotas || ""
                        }
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
                        value={championshipData.dataMatrix[index]?.saldo || ""}
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
                        value={championshipData.dataMatrix[index]?.jogos || ""}
                        onChange={(e) =>
                          handleTableInputChange(index, "jogos", e)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {championshipData.championshipType === "grupo" && (
              <>
                {(championshipData.groups || []).map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className={styles.form}>
                      <p className={styles.label}>Nome do Grupo</p>
                      <input
                        type="text"
                        className={styles.field}
                        value={group.groupName}
                        onChange={(e) => {
                          const updatedGroups = [
                            ...(championshipData.groups || []),
                          ];
                          updatedGroups[groupIndex].groupName = e.target.value;
                          setChampionshipData((prevState) => ({
                            ...prevState,
                            groups: updatedGroups,
                          }));
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
                            const updatedGroups = [
                              ...(championshipData.groups || []),
                            ];
                            updatedGroups[groupIndex].count = value;
                            setChampionshipData((prevState) => ({
                              ...prevState,
                              groups: updatedGroups,
                            }));
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
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.position) ||
                              ""
                            }
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
                          <p className={styles.tableLabel}>
                            Time (
                            {(championshipData.groups &&
                              championshipData.groups[groupIndex]?.dataMatrix[
                                rowIndex
                              ]?.time) ||
                              ""}
                            )
                          </p>
                          <SearchSelectTeam
                            onSelectItem={(team: Item) => {
                              const updatedGroups = [
                                ...(championshipData.groups || []),
                              ];
                              if (
                                !updatedGroups[groupIndex].dataMatrix[rowIndex]
                              ) {
                                updatedGroups[groupIndex].dataMatrix[rowIndex] =
                                  {
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
                              updatedGroups[groupIndex].dataMatrix[
                                rowIndex
                              ].time = team.name;
                              updatedGroups[groupIndex].dataMatrix[
                                rowIndex
                              ].logo = team.logo;
                              setChampionshipData((prevState) => ({
                                ...prevState,
                                groups: updatedGroups,
                              }));
                            }}
                          />
                        </div>
                        <div className={styles.tableItem}>
                          <p className={styles.tableLabel}>Pts</p>
                          <input
                            type="number"
                            className={styles.position}
                            pattern="\d*"
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.pontos) ||
                              ""
                            }
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
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.victories) ||
                              ""
                            }
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
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.derrotas) ||
                              ""
                            }
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
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.saldo) ||
                              ""
                            }
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
                            value={
                              (championshipData.groups &&
                                championshipData.groups[groupIndex]?.dataMatrix[
                                  rowIndex
                                ]?.jogos) ||
                              ""
                            }
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

            {championshipData.championshipType === "mataMata" && (
              <>
                {(championshipData.mataMataData || []).map(
                  (fase, faseIndex) => (
                    <div key={faseIndex}>
                      <div className={styles.form}>
                        <p className={styles.label}>Nome da fase</p>
                        <input
                          type="text"
                          className={styles.field}
                          value={fase.faseName}
                          onChange={(e) => {
                            const updatedMataMataData = [
                              ...(championshipData.mataMataData || []),
                            ];
                            updatedMataMataData[faseIndex].faseName =
                              e.target.value;
                            setChampionshipData((prevState) => ({
                              ...prevState,
                              mataMataData: updatedMataMataData,
                            }));
                          }}
                          placeholder="Nome da Fase"
                        />
                      </div>

                      {fase.partidas.map((partida, partidaIndex) => (
                        <div key={partidaIndex}>
                          <div className={styles.tableItem}>
                            <p className={styles.tableLabel}>
                              Time A ({partida.timeA})
                            </p>
                            <SearchSelectTeam
                              onSelectItem={(team: Item) => {
                                const updatedMataMataData = [
                                  ...(championshipData.mataMataData || []),
                                ];
                                if (
                                  !updatedMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ]
                                ) {
                                  updatedMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ] = {
                                    timeA: "",
                                    timeB: "",
                                  };
                                }
                                updatedMataMataData[faseIndex].partidas[
                                  partidaIndex
                                ].timeA = team.name;
                                setChampionshipData((prevState) => ({
                                  ...prevState,
                                  mataMataData: updatedMataMataData,
                                }));
                              }}
                            />
                          </div>
                          <div className={styles.tableItem}>
                            <p className={styles.tableLabel}>
                              Time B ({partida.timeB})
                            </p>
                            <SearchSelectTeam
                              onSelectItem={(team: Item) => {
                                const updatedMataMataData = [
                                  ...(championshipData.mataMataData || []),
                                ];
                                if (
                                  !updatedMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ]
                                ) {
                                  updatedMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ] = {
                                    timeA: "",
                                    timeB: "",
                                  };
                                }
                                updatedMataMataData[faseIndex].partidas[
                                  partidaIndex
                                ].timeB = team.name;
                                setChampionshipData((prevState) => ({
                                  ...prevState,
                                  mataMataData: updatedMataMataData,
                                }));
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
                  )
                )}

                <button onClick={addFase} className={styles.newPlayer}>
                  Adicionar Fase
                </button>
              </>
            )}
          </form>
          <button onClick={handleClick} className={styles.save}>
            SALVAR
          </button>
        </div>
        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
