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

import SearchSelect from "@/components/SearchSelect";
import SearchSelectTeam from "@/components/SearchSelectTable";
import HomeButton from "../../components/HomeButton";

interface ChampionShip {
  id: string;
  name: string;
  year: string;
  logo: string | File | null;
  description: string;
  phases: Phase[];
  rankings?: Ranking[];
}

interface Phase {
  id: number;
  type: string;
  count: number;
  dataMatrix: TableData[];
  groups?: { groupName: string; count: number; dataMatrix: TableData[] }[];
  mataMataData?: {
    faseName: string;
    partidas: { timeA: string; logoA: string; timeB: string; logoB: string }[];
  }[];
}

interface Item {
  id: string;
  name: string;
  logo: string;
}

interface Criterion {
  name: string;
  type: string;
}

interface Player {
  id: string;
  name: string;
  photo: string;
}

interface Ranking {
  name: string;
  value: number;
  athlete: string;
  photo: string;
}

type TableData = {
  [key: string]: string | number;
};

export default function EditChampionship() {
  const [championshipData, setChampionshipData] = useState<ChampionShip>({
    id: "",
    name: "",
    year: "",
    logo: null,
    description: "",
    phases: [],
    rankings: [],
  });

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const router = useRouter();
  const { id } = router.query;

  const [rankings, setRankings] = useState<Ranking[]>([]);

  const handleRemovePosition = (phaseIndex: number, rowIndex: number) => {
    const updatedPhases = [...championshipData.phases];
    updatedPhases[phaseIndex].dataMatrix = updatedPhases[
      phaseIndex
    ].dataMatrix.filter((_, i) => i !== rowIndex);
    updatedPhases[phaseIndex].count =
      updatedPhases[phaseIndex].dataMatrix.length;

    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const addRanking = () => {
    setRankings([...rankings, { name: "", value: 0, athlete: "", photo: "" }]);
  };

  const removeRanking = (index: number) => {
    setRankings(rankings.filter((_, i) => i !== index));
  };

  const handleRankingChange = (
    index: number,
    field: keyof Ranking,
    value: string | number
  ) => {
    setRankings((prevRankings) => {
      const updatedRankings = [...prevRankings];
      updatedRankings[index] = { ...updatedRankings[index], [field]: value };
      return updatedRankings;
    });
  };

  const handleSelectPlayer = (index: number, player: Player) => {
    setRankings((prevRankings) => {
      const updatedRankings = [...prevRankings];
      updatedRankings[index] = {
        ...updatedRankings[index],
        athlete: player.name,
        photo: player.photo,
      };
      return updatedRankings;
    });
  };

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

  const handleCountChange = (
    phaseIndex: number,
    groupIndex: number | null,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    const updatedPhases = [...championshipData.phases];

    if (groupIndex === null) {
      updatedPhases[phaseIndex].count = value;
    } else {
      updatedPhases[phaseIndex].groups![groupIndex].count = value;
    }

    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
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

          if (championship.phases.length > 0) {
            let extractedCriteria: Criterion[] = [];

            championship.phases.forEach((phase) => {
              if (
                phase.type === "todosContraTodos" &&
                phase.dataMatrix.length > 0
              ) {
                const sampleData = phase.dataMatrix[0];
                Object.keys(sampleData).forEach((key) => {
                  if (key !== "time" && key !== "logo" && key !== "position") {
                    extractedCriteria.push({
                      name: key,
                      type: typeof sampleData[key],
                    });
                  }
                });
              }

              if (phase.type === "grupo" && phase.groups) {
                phase.groups.forEach((group) => {
                  if (group.dataMatrix.length > 0) {
                    const sampleData = group.dataMatrix[0];
                    Object.keys(sampleData).forEach((key) => {
                      if (
                        key !== "time" &&
                        key !== "logo" &&
                        key !== "position"
                      ) {
                        extractedCriteria.push({
                          name: key,
                          type: typeof sampleData[key],
                        });
                      }
                    });
                  }
                });
              }
            });

            const uniqueCriteria = Array.from(
              new Set(extractedCriteria.map((a) => a.name))
            ).map((name) => extractedCriteria.find((a) => a.name === name)!);

            setCriteria(uniqueCriteria);
          }

          if (championship.rankings) {
            setRankings(championship.rankings);
          }
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
      let updatedChampionshipData = { ...championshipData };

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

      updatedChampionshipData.rankings = rankings;

      await setDoc(
        doc(db, "championships", id as string),
        updatedChampionshipData
      );

      toast.success("Campeonato atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar o campeonato: ", error);
      toast.error("Erro ao atualizar o campeonato.");
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  const handleTableInputChange = (
    phaseIndex: number,
    rowIndex: number,
    type: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPhases = [...championshipData.phases];
    const value =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;

    if (!updatedPhases[phaseIndex].dataMatrix[rowIndex]) {
      updatedPhases[phaseIndex].dataMatrix[rowIndex] = {
        time: "",
        logo: "",
        position: "",
      };
      criteria.forEach((criterion) => {
        updatedPhases[phaseIndex].dataMatrix[rowIndex][criterion.name] = "";
      });
    }
    updatedPhases[phaseIndex].dataMatrix[rowIndex][type] = value;
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const handleGroupInputChange = (
    phaseIndex: number,
    groupIndex: number,
    rowIndex: number,
    field: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedPhases = [...championshipData.phases];
    const updatedGroups = updatedPhases[phaseIndex].groups || [];

    if (!updatedGroups[groupIndex].dataMatrix[rowIndex]) {
      updatedGroups[groupIndex].dataMatrix[rowIndex] = {
        time: "",
        logo: "",
        position: "",
      };
      criteria.forEach((criterion) => {
        updatedGroups[groupIndex].dataMatrix[rowIndex][criterion.name] = "";
      });
    }

    updatedGroups[groupIndex].dataMatrix[rowIndex][field] =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;

    updatedPhases[phaseIndex].groups = updatedGroups;
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const handleCriterionChange = (name: string, value: string) => {
    const updatedCriteria = criteria.map((criterion) =>
      criterion.name === name ? { ...criterion, name: value } : criterion
    );
    setCriteria(updatedCriteria);
  };

  const addNewCriterion = () => {
    setCriteria([...criteria, { name: "", type: "number" }]);
  };

  const removeCriterion = (name: string) => {
    const updatedCriteria = criteria.filter(
      (criterion) => criterion.name !== name
    );
    const updatedPhases = championshipData.phases.map((phase) => {
      if (phase.type === "todosContraTodos") {
        const updatedDataMatrix = phase.dataMatrix.map((row) => {
          const newRow = { ...row };
          delete newRow[name];
          return newRow;
        });
        return { ...phase, dataMatrix: updatedDataMatrix };
      }
      return phase;
    });
    setCriteria(updatedCriteria);
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const addNewGroup = (phaseIndex: number) => {
    const updatedPhases = [...championshipData.phases];
    const updatedGroups = updatedPhases[phaseIndex].groups || [];
    updatedGroups.push({ groupName: "", count: 0, dataMatrix: [] });
    updatedPhases[phaseIndex].groups = updatedGroups;
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const removeGroup = (phaseIndex: number, groupIndex: number) => {
    const updatedPhases = [...championshipData.phases];
    updatedPhases[phaseIndex].groups = updatedPhases[phaseIndex].groups?.filter(
      (_, index) => index !== groupIndex
    );
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const addFase = (phaseIndex: number) => {
    const updatedPhases = [...championshipData.phases];
    const newFase = { faseName: "", partidas: [] };
    updatedPhases[phaseIndex].mataMataData = [
      ...(updatedPhases[phaseIndex].mataMataData || []),
      newFase,
    ];
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const addPartida = (phaseIndex: number, faseIndex: number) => {
    const updatedPhases = [...championshipData.phases];
    const newPartida = { timeA: "", timeB: "", logoA: "", logoB: "" };
    updatedPhases[phaseIndex].mataMataData![faseIndex].partidas.push(
      newPartida
    );
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const removePartida = (
    phaseIndex: number,
    faseIndex: number,
    partidaIndex: number
  ) => {
    const updatedPhases = [...championshipData.phases];
    updatedPhases[phaseIndex].mataMataData![faseIndex].partidas = updatedPhases[
      phaseIndex
    ].mataMataData![faseIndex].partidas.filter(
      (_, index) => index !== partidaIndex
    );
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

  const addNewPhase = () => {
    const newPhase = {
      id: championshipData.phases.length + 1,
      type: "todosContraTodos",
      count: 0,
      dataMatrix: [],
    };
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: [...prevState.phases, newPhase],
    }));
  };

  const removePhase = (phaseIndex: number) => {
    const updatedPhases = championshipData.phases.filter(
      (_, index) => index !== phaseIndex
    );
    setChampionshipData((prevState) => ({
      ...prevState,
      phases: updatedPhases,
    }));
  };

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
              <p className={styles.label}>Inicio do Campeonato</p>
              <input
                className={styles.field}
                type="date"
                value={championshipData.year}
                name="year"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Critérios do Campeonato</p>
              {criteria.map((criterion, index) => (
                <div key={index} className={styles.criterion}>
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) =>
                      handleCriterionChange(criterion.name, e.target.value)
                    }
                    placeholder="Nome do Critério"
                  />
                  <button
                    type="button"
                    onClick={() => removeCriterion(criterion.name)}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button type="button" onClick={addNewCriterion}>
                Adicionar Critério
              </button>
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

            {championshipData.phases.map((phase, phaseIndex) => (
              <div key={phase.id} className={styles.form}>
                <p className={styles.label}>Tipo de Classificação</p>
                <select
                  className={styles.field}
                  value={phase.type}
                  onChange={(e) => {
                    const updatedPhases = [...championshipData.phases];
                    updatedPhases[phaseIndex].type = e.target.value;
                    setChampionshipData((prevState) => ({
                      ...prevState,
                      phases: updatedPhases,
                    }));
                  }}
                >
                  <option value="todosContraTodos">Todos contra todos</option>
                  <option value="grupo">Grupo</option>
                  <option value="mataMata">Mata Mata</option>
                </select>

                {phase.type === "todosContraTodos" && (
                  <>
                    <div className={styles.headTable}>
                      <p className={styles.label}>
                        Tabela do Campeonato - Nº de posições
                      </p>
                      <input
                        type="number"
                        className={styles.pos}
                        value={phase.count ?? ""}
                        onChange={(e) => handleCountChange(phaseIndex, null, e)}
                      />
                    </div>

                    {Array.from({ length: phase.count ?? 0 }).map(
                      (_, rowIndex) => (
                        <div key={rowIndex} className={styles.table}>
                          <div className={styles.tableItem}>
                            <p className={styles.tableLabel}>Posi</p>
                            <input
                              type="number"
                              className={styles.position}
                              value={phase.dataMatrix[rowIndex]?.position ?? ""}
                              onChange={(e) =>
                                handleTableInputChange(
                                  phaseIndex,
                                  rowIndex,
                                  "position",
                                  e
                                )
                              }
                            />
                          </div>
                          <div className={styles.tableItem}>
                            <p className={styles.tableLabel}>
                              Time ({phase.dataMatrix[rowIndex]?.time ?? ""})
                            </p>
                            <SearchSelectTeam
                              onSelectItem={(team: Item) => {
                                const updatedPhases = [
                                  ...championshipData.phases,
                                ];
                                if (
                                  !updatedPhases[phaseIndex].dataMatrix[
                                    rowIndex
                                  ]
                                ) {
                                  updatedPhases[phaseIndex].dataMatrix[
                                    rowIndex
                                  ] = {
                                    time: "",
                                    logo: "",
                                  };
                                }
                                updatedPhases[phaseIndex].dataMatrix[
                                  rowIndex
                                ].time = team.name;
                                updatedPhases[phaseIndex].dataMatrix[
                                  rowIndex
                                ].logo = team.logo;
                                setChampionshipData((prevState) => ({
                                  ...prevState,
                                  phases: updatedPhases,
                                }));
                              }}
                            />
                          </div>
                          {criteria.map((criterion, i) => (
                            <div key={i} className={styles.tableItem}>
                              <p className={styles.tableLabel}>
                                {criterion.name.slice(0, 2)}
                              </p>
                              <input
                                type={criterion.type}
                                className={styles.position}
                                value={
                                  phase.dataMatrix[rowIndex]?.[
                                    criterion.name
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  handleTableInputChange(
                                    phaseIndex,
                                    rowIndex,
                                    criterion.name,
                                    e
                                  )
                                }
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemovePosition(phaseIndex, rowIndex)
                            }
                            className={styles.removePlayer}
                          >
                            Remover
                          </button>
                        </div>
                      )
                    )}
                  </>
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
                              const updatedPhases = [
                                ...championshipData.phases,
                              ];
                              updatedPhases[phaseIndex].groups![
                                groupIndex
                              ].groupName = e.target.value;
                              setChampionshipData((prevState) => ({
                                ...prevState,
                                phases: updatedPhases,
                              }));
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGroup(phaseIndex, groupIndex)}
                          className={styles.newPlayer}
                        >
                          Remover Grupo
                        </button>

                        <div className={styles.headTable}>
                          <p className={styles.label}>
                            Tabela do Grupo - Nº de posições
                          </p>
                          <input
                            type="number"
                            className={styles.pos}
                            value={group.count}
                            onChange={(e) =>
                              handleCountChange(phaseIndex, groupIndex, e)
                            }
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
                                    (group.dataMatrix[rowIndex] &&
                                      group.dataMatrix[rowIndex].position) ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleGroupInputChange(
                                      phaseIndex,
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
                                  Time:{" "}
                                  {(group.dataMatrix[rowIndex] &&
                                    group.dataMatrix[rowIndex].time) ||
                                    ""}
                                </p>
                                <SearchSelectTeam
                                  onSelectItem={(team: Item) => {
                                    const updatedPhases = [
                                      ...championshipData.phases,
                                    ];
                                    if (
                                      !updatedPhases[phaseIndex].groups![
                                        groupIndex
                                      ].dataMatrix[rowIndex]
                                    ) {
                                      updatedPhases[phaseIndex].groups![
                                        groupIndex
                                      ].dataMatrix[rowIndex] = {
                                        time: "",
                                        logo: "",
                                      };
                                    }
                                    updatedPhases[phaseIndex].groups![
                                      groupIndex
                                    ].dataMatrix[rowIndex].time = team.name;
                                    updatedPhases[phaseIndex].groups![
                                      groupIndex
                                    ].dataMatrix[rowIndex].logo = team.logo;
                                    setChampionshipData((prevState) => ({
                                      ...prevState,
                                      phases: updatedPhases,
                                    }));
                                  }}
                                />
                              </div>
                              {criteria.map((criterion, i) => (
                                <div key={i} className={styles.tableItem}>
                                  <p className={styles.tableLabel}>
                                    {criterion.name.slice(0, 2)}
                                  </p>
                                  <input
                                    type={criterion.type}
                                    className={styles.position}
                                    value={
                                      (group.dataMatrix[rowIndex] &&
                                        group.dataMatrix[rowIndex][
                                          criterion.name
                                        ]) ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleGroupInputChange(
                                        phaseIndex,
                                        groupIndex,
                                        rowIndex,
                                        criterion.name,
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
                      type="button"
                      onClick={() => addNewGroup(phaseIndex)}
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
                              const updatedPhases = [
                                ...championshipData.phases,
                              ];
                              updatedPhases[phaseIndex].mataMataData![
                                faseIndex
                              ].faseName = e.target.value;
                              setChampionshipData((prevState) => ({
                                ...prevState,
                                phases: updatedPhases,
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
                                  const updatedPhases = [
                                    ...championshipData.phases,
                                  ];
                                  updatedPhases[phaseIndex].mataMataData![
                                    faseIndex
                                  ].partidas[partidaIndex].timeA = team.name;
                                  updatedPhases[phaseIndex].mataMataData![
                                    faseIndex
                                  ].partidas[partidaIndex].logoA = team.logo;
                                  setChampionshipData((prevState) => ({
                                    ...prevState,
                                    phases: updatedPhases,
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
                                  const updatedPhases = [
                                    ...championshipData.phases,
                                  ];
                                  updatedPhases[phaseIndex].mataMataData![
                                    faseIndex
                                  ].partidas[partidaIndex].timeB = team.name;
                                  updatedPhases[phaseIndex].mataMataData![
                                    faseIndex
                                  ].partidas[partidaIndex].logoB = team.logo;
                                  setChampionshipData((prevState) => ({
                                    ...prevState,
                                    phases: updatedPhases,
                                  }));
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removePartida(
                                  phaseIndex,
                                  faseIndex,
                                  partidaIndex
                                )
                              }
                              className={styles.newPlayer}
                            >
                              Remover Partida
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addPartida(phaseIndex, faseIndex)}
                          className={styles.newPlayer}
                        >
                          Adicionar Partida
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addFase(phaseIndex)}
                      className={styles.newPlayer}
                    >
                      Adicionar Fase
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => removePhase(phaseIndex)}
                  className={styles.newPlayer}
                >
                  Remover Fase
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addNewPhase}
              className={styles.newPlayer}
            >
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
                    className={styles.field}
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
                    className={styles.field}
                  />
                  <div>
                    <p className={styles.label}>{ranking.athlete}</p>
                    <SearchSelect
                      onSelectItems={(players: Player[]) => {
                        const player = players[0];
                        console.log("Selected Player:", player);
                        handleSelectPlayer(index, player);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRanking(index)}
                    className={styles.newPlayer}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRanking}
                className={styles.newPlayer}
              >
                Adicionar Ranking
              </button>
            </div>
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
