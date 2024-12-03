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

import SearchSelect from "@/components/SearchSelect";
import SearchSelectTeam from "@/components/SearchSelectTable";
import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface ChampionShip {
  id: string;
  name: string;
  year: string;
  logo: string | null;
  criterion: string;
  description: string;
  dataMatrix: TableData[];
  groups?: { groupName: string; count: number; dataMatrix: TableData[] }[];
  mataMataData?: {
    faseName: string;
    partidas: { timeA: string; logoA: string; timeB: string; logoB: string }[];
  }[];
  count: number;
  championshipType?: string;
}

interface Item {
  id: string;
  name: string;
  logo: string; // Pode ser usado como 'photo' se este campo representa a foto
}

interface Player {
  id: string;
  name: string;
  photo: string; // Pode ser usado como 'photo' se este campo representa a foto
}

interface Criterion {
  id: number;
  name: string;
  type: string;
}

interface Ranking {
  name: string;
  value: string;
  athlete: string;
  photo: string;
}

type TableData = {
  [key: string]: string | number;
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
    year: "",
    logo: null,
    criterion: "",
    description: "",
    dataMatrix: [],
    count: 0,
  });

  const [phases, setPhases] = useState<
    {
      id: number;
      type: string;
      count?: number;
      dataMatrix: TableData[];
      groups?: { groupName: string; count: number; dataMatrix: TableData[] }[];
      mataMataData?: {
        faseName: string;
        partidas: {
          timeA: string;
          logoA: string;
          timeB: string;
          logoB: string;
        }[];
      }[];
    }[]
  >([{ id: 1, type: "todosContraTodos", dataMatrix: [] }]);

  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 1, name: "Pontos", type: "number" },
    { id: 2, name: "Vitórias", type: "number" },
    { id: 3, name: "Derrotas", type: "number" },
    { id: 4, name: "Saldo", type: "number" },
    { id: 5, name: "Jogos", type: "number" },
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);

  const [rankings, setRankings] = useState<Ranking[]>([]);

  const addRanking = () => {
    setRankings([...rankings, { name: "", value: "", athlete: "", photo: "" }]);
  };

  const removeRanking = (index: number) => {
    setRankings(rankings.filter((_, i) => i !== index));
  };

  const handleRankingChange = (
    index: number,
    field: keyof Ranking,
    value: string | number
  ) => {
    console.log(
      `handleRankingChange - index: ${index}, field: ${field}, value: ${value}`
    );
    const updatedRankings = [...rankings];
    updatedRankings[index] = { ...updatedRankings[index], [field]: value };
    console.log("Updated Rankings:", updatedRankings);
    setRankings(updatedRankings);
  };

  const handleSelectPlayer = (index: number, player: Player) => {
    const updatedRankings = [...rankings];
    updatedRankings[index] = {
      ...updatedRankings[index],
      athlete: player.name,
      photo: player.photo,
    };
    console.log("Updated Rankings:", updatedRankings);
    setRankings(updatedRankings);
  };

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

  const handleCriterionChange = (
    id: number,
    field: keyof Criterion,
    value: string
  ) => {
    const updatedCriteria = criteria.map((criterion) => {
      if (criterion.id === id) {
        return { ...criterion, [field]: value };
      }
      return criterion;
    });
    setCriteria(updatedCriteria);
  };

  const addNewCriterion = () => {
    const newId = criteria.length ? criteria[criteria.length - 1].id + 1 : 1;
    setCriteria([...criteria, { id: newId, name: "", type: "number" }]);
  };

  const removeCriterion = (id: number) => {
    setCriteria(criteria.filter((criterion) => criterion.id !== id));
    setPhases(
      phases.map((phase) => ({
        ...phase,
        dataMatrix: phase.dataMatrix.map((row) => {
          const newRow = { ...row };
          delete newRow[criteria.find((c) => c.id === id)?.name as string];
          return newRow;
        }),
      }))
    );
  };

  const addNewPhase = () => {
    const newPhaseId = phases.length ? phases[phases.length - 1].id + 1 : 1;
    setPhases([
      ...phases,
      { id: newPhaseId, type: "todosContraTodos", dataMatrix: [] },
    ]);
  };

  const handlePhaseTypeChange = (
    phaseId: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = event.target;
    setPhases(
      phases.map((phase) =>
        phase.id === phaseId ? { ...phase, type: value } : phase
      )
    );
  };

  const handleSelectTeam = (
    phaseId: number,
    team: Item,
    index: number,
    groupIndex?: number
  ) => {
    const newPhases = phases.map((phase) => {
      if (phase.id === phaseId) {
        if (phase.type === "grupo" && groupIndex !== undefined) {
          const newGroups = [...phase.groups!];
          if (!newGroups[groupIndex].dataMatrix[index]) {
            newGroups[groupIndex].dataMatrix[index] = { time: "", logo: "" };
          }
          newGroups[groupIndex].dataMatrix[index].time = team.name;
          newGroups[groupIndex].dataMatrix[index].logo = team.logo;
          return { ...phase, groups: newGroups };
        } else {
          const newDataMatrix = [...phase.dataMatrix];
          if (!newDataMatrix[index]) {
            newDataMatrix[index] = { time: "", logo: "" };
          }
          newDataMatrix[index].time = team.name;
          newDataMatrix[index].logo = team.logo;
          return { ...phase, dataMatrix: newDataMatrix };
        }
      }
      return phase;
    });

    setPhases(newPhases);
  };

  const handleTableInputChange = (
    phaseId: number,
    index: number,
    type: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value; // Capture o valor como string

    const updatedMatrix = phases.map((phase) => {
      if (phase.id === phaseId) {
        const newDataMatrix = [...phase.dataMatrix];

        if (!newDataMatrix[index]) {
          newDataMatrix[index] = {
            time: "",
            logo: "",
            position: "",
          };
        }

        newDataMatrix[index][type] = value; // Atribua o valor diretamente

        return { ...phase, dataMatrix: newDataMatrix };
      }
      return phase;
    });

    setPhases(updatedMatrix);
  };

  const handleGroupInputChange = (
    phaseId: number,
    groupIndex: number,
    rowIndex: number,
    type: keyof TableData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPhases = phases.map((phase) => {
      if (phase.id === phaseId) {
        const newGroups = [...phase.groups!];

        if (!newGroups[groupIndex]) {
          newGroups[groupIndex] = { groupName: "", count: 0, dataMatrix: [] };
        }

        const updatedMatrix = [...newGroups[groupIndex].dataMatrix];

        if (!updatedMatrix[rowIndex]) {
          updatedMatrix[rowIndex] = {
            time: "",
            logo: "",
            position: "",
          };
        }

        updatedMatrix[rowIndex][type] = e.target.value;
        newGroups[groupIndex].dataMatrix = updatedMatrix;
        return { ...phase, groups: newGroups };
      }
      return phase;
    });

    setPhases(newPhases);
  };

  const handleAddGroup = (phaseId: number) => {
    setPhases(
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              groups: [
                ...(phase.groups || []),
                { groupName: "", count: 0, dataMatrix: [] },
              ],
            }
          : phase
      )
    );
  };

  const handleAddPartida = (phaseId: number, faseIndex: number) => {
    setPhases(
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              mataMataData: phase.mataMataData?.map((fase, index) =>
                index === faseIndex
                  ? {
                      ...fase,
                      partidas: [
                        ...fase.partidas,
                        { timeA: "", logoA: "", timeB: "", logoB: "" },
                      ],
                    }
                  : fase
              ),
            }
          : phase
      )
    );
  };

  const handleAddFase = (phaseId: number) => {
    setPhases(
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              mataMataData: [
                ...(phase.mataMataData || []),
                {
                  faseName: "",
                  partidas: [{ timeA: "", logoA: "", timeB: "", logoB: "" }],
                },
              ],
            }
          : phase
      )
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    let imageUrl = "";
    if (selectedFile) {
      const storageRef = ref(storage, `championships/${selectedFile.name}`);
      const fileSnapshot = await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(fileSnapshot.ref);
    }

    const dataToSave = {
      ...championShipData,
      logo: imageUrl,
      phases,
      rankings, // Incluindo rankings
    };

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
      year: "",
      criterion: "",
      description: "",
      dataMatrix: [],
      count: 0,
    });

    setPreviewImage(null);
    setSelectedFile(null);
    setRankings([]); // Resetando os rankings
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
      <HomeButton />

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Campeonatos</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONATO</p>
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
            <p className={styles.label}>Inicio Campeonato</p>
            <input
              className={styles.field}
              type="date"
              onChange={(e) => handleInputChange(e, "year")}
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Critérios do Campeonato</p>
            {criteria.map((criterion, index) => (
              <div key={criterion.id} className={styles.criterion}>
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) =>
                    handleCriterionChange(criterion.id, "name", e.target.value)
                  }
                  placeholder="Nome do Critério"
                />
                <select
                  value={criterion.type}
                  onChange={(e) =>
                    handleCriterionChange(criterion.id, "type", e.target.value)
                  }
                >
                  <option value="number">Numérico</option>
                  <option value="text">Texto</option>
                </select>
                <button onClick={() => removeCriterion(criterion.id)}>
                  Remover
                </button>
              </div>
            ))}
            <button onClick={addNewCriterion}>Adicionar Critério</button>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Descrição do Campeonato</p>
            <textarea
              className={styles.field}
              onChange={(e) => handleTextAreaChange(e, "description")}
            />
          </div>

          {phases.map((phase, phaseIndex) => (
            <div key={phase.id} className={styles.form}>
              <p className={styles.label}>Tipo de Classificação</p>
              <select
                className={styles.field}
                value={phase.type}
                onChange={(e) => handlePhaseTypeChange(phase.id, e)}
              >
                <option value="todosContraTodos">Todos contra todos</option>
                <option value="grupo">Grupo</option>
                <option value="mataMata">Mata Mata</option>
              </select>

              {phase.type === "todosContraTodos" && (
                <div className={styles.form}>
                  <div className={styles.headTable}>
                    <p className={styles.label}>
                      Tabela do Campeonato - insira o Nº posições
                    </p>
                    <input
                      type="number" // Mudei para "number" para garantir que o input aceita números corretamente
                      className={styles.pos}
                      value={phase.count || ""} // Mantém o valor do input mesmo que seja 0
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          setPhases(
                            phases.map((p) =>
                              p.id === phase.id ? { ...p, count: value } : p
                            )
                          );
                        }
                      }}
                    />
                  </div>

                  {Array.from({ length: phase.count || 0 }).map((_, index) => (
                    <div key={index} className={styles.table}>
                      <div className={styles.tableItem}>
                        <p className={styles.tableLabel}>Posi</p>
                        <input
                          type="number"
                          className={styles.position}
                          value={
                            phase.dataMatrix[index]?.position ?? "" // Usa nullish coalescing (??) para garantir que "0" seja exibido corretamente
                          }
                          onChange={(e) =>
                            handleTableInputChange(
                              phase.id,
                              index,
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
                            handleSelectTeam(phase.id, team, index);
                          }}
                        />
                      </div>
                      {criteria.map((criterion) => (
                        <div key={criterion.id} className={styles.tableItem}>
                          <p className={styles.tableLabel}>
                            {criterion.name.slice(0, 2)}
                          </p>
                          <input
                            type={
                              criterion.type === "number" ? "number" : "text"
                            } // Garantir que tipos de números são aceitos
                            className={styles.position}
                            value={
                              phase.dataMatrix[index]?.[criterion.name] ?? "" // Usa nullish coalescing para garantir que "0" seja exibido corretamente
                            }
                            onChange={(e) =>
                              handleTableInputChange(
                                phase.id,
                                index,
                                criterion.name,
                                e
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {phase.type === "grupo" && (
                <>
                  {phase.groups?.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <div className={styles.form}>
                        <p className={styles.label}>Nome do Grupo</p>
                        <input
                          type="text"
                          className={styles.field}
                          value={group.groupName}
                          onChange={(e) => {
                            const newGroups = [...phase.groups!];
                            newGroups[groupIndex].groupName = e.target.value;
                            setPhases(
                              phases.map((p) =>
                                p.id === phase.id
                                  ? { ...p, groups: newGroups }
                                  : p
                              )
                            );
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
                              const newGroups = [...phase.groups!];
                              newGroups[groupIndex].count = value;
                              setPhases(
                                phases.map((p) =>
                                  p.id === phase.id
                                    ? { ...p, groups: newGroups }
                                    : p
                                )
                              );
                            }
                          }}
                        />
                      </div>

                      {Array.from({ length: group.count }).map(
                        (_, rowIndex) => (
                          <div key={rowIndex} className={styles.table}>
                            <div className={styles.tableItem}>
                              <p className={styles.tableLabel}>Posi</p>
                              <input
                                type="number"
                                className={styles.position}
                                value={
                                  (phase.groups![groupIndex].dataMatrix[
                                    rowIndex
                                  ] &&
                                    phase.groups![groupIndex].dataMatrix[
                                      rowIndex
                                    ].position) ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleGroupInputChange(
                                    phase.id,
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
                                  handleSelectTeam(
                                    phase.id,
                                    team,
                                    rowIndex,
                                    groupIndex
                                  );
                                }}
                              />
                            </div>
                            {criteria.map((criterion) => (
                              <div
                                key={criterion.id}
                                className={styles.tableItem}
                              >
                                <p className={styles.tableLabel}>
                                  {criterion.name.slice(0, 2)}
                                </p>
                                <input
                                  type={criterion.type}
                                  className={styles.position}
                                  value={
                                    (phase.groups![groupIndex].dataMatrix[
                                      rowIndex
                                    ] &&
                                      phase.groups![groupIndex].dataMatrix[
                                        rowIndex
                                      ][criterion.name]) ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleGroupInputChange(
                                      phase.id,
                                      groupIndex,
                                      rowIndex,
                                      criterion.name as keyof TableData,
                                      e
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddGroup(phase.id)}
                    className={styles.newPlayer}
                  >
                    Adicionar Novo Grupo
                  </button>
                </>
              )}

              {phase.type === "mataMata" && (
                <>
                  {phase.mataMataData?.map((fase, faseIndex) => (
                    <div key={faseIndex}>
                      <div className={styles.form}>
                        <p className={styles.label}>Nome da fase</p>
                        <input
                          type="text"
                          className={styles.field}
                          value={fase.faseName}
                          onChange={(e) => {
                            const newMataMataData = [...phase.mataMataData!];
                            newMataMataData[faseIndex].faseName =
                              e.target.value;
                            setPhases(
                              phases.map((p) =>
                                p.id === phase.id
                                  ? { ...p, mataMataData: newMataMataData }
                                  : p
                              )
                            );
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
                                const newMataMataData = [
                                  ...phase.mataMataData!,
                                ];
                                if (
                                  !newMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ]
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
                                setPhases(
                                  phases.map((p) =>
                                    p.id === phase.id
                                      ? { ...p, mataMataData: newMataMataData }
                                      : p
                                  )
                                );
                              }}
                            />
                          </div>
                          <div className={styles.tableItem}>
                            <p className={styles.tableLabel}>Time B</p>
                            <SearchSelectTeam
                              onSelectItem={(team: Item) => {
                                const newMataMataData = [
                                  ...phase.mataMataData!,
                                ];
                                if (
                                  !newMataMataData[faseIndex].partidas[
                                    partidaIndex
                                  ]
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
                                setPhases(
                                  phases.map((p) =>
                                    p.id === phase.id
                                      ? { ...p, mataMataData: newMataMataData }
                                      : p
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddPartida(phase.id, faseIndex)}
                        className={styles.newPlayer}
                      >
                        Adicionar Partida
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddFase(phase.id)}
                    className={styles.newPlayer}
                  >
                    Adicionar Fase
                  </button>
                </>
              )}
            </div>
          ))}
          <button onClick={addNewPhase} className={styles.newPlayer}>
            Adicionar Nova Fase
          </button>

          <div className={styles.form}>
            <p className={styles.label}>Rankings Individuais</p>
            {rankings.map((ranking, index) => (
              <div key={index} className={styles.ranking}>
                <input
                  type="text"
                  value={ranking.name}
                  onChange={(e) =>
                    handleRankingChange(index, "name", e.target.value)
                  }
                  placeholder="Nome do Ranking"
                />
                <input
                  type="number"
                  value={ranking.value}
                  onChange={(e) =>
                    handleRankingChange(
                      index,
                      "value",
                      parseFloat(e.target.value)
                    )
                  }
                  placeholder="Valor"
                />
                <SearchSelect
                  onSelectItems={(players: Player[]) => {
                    const player = players[0];
                    console.log("Selected Player:", player);
                    handleSelectPlayer(index, player);
                  }}
                />

                <button onClick={() => removeRanking(index)}>Remover</button>
              </div>
            ))}
            <button onClick={addRanking} className={styles.newPlayer}>
              Adicionar Ranking
            </button>
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
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { mdl } = query;

  return {
    props: {
      modalityForm: { id: mdl },
    },
  };
}
