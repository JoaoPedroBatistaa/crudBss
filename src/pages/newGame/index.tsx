import { collection, db, doc, getDoc } from "@/firebase";
import { deleteDoc, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

import { GetServerSidePropsContext } from "next";
import { toast } from "react-toastify";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
  name: string;
}

interface Matche {
  id: string;
  team_1?: {
    score: string;
    team_id?: string;
    team_data?: Team;
  };
  team_2?: {
    score: string;
    team_id?: string;
    team_data?: Team;
  };
  next_team_1?: string;
  next_team_2?: string;
  time: string;
  venue: string;
  date: string;
  championship: string;
}

interface Team {
  id: string;
  name: string;
  logo: string;
}

interface Championship {
  id: string;
  name: string;
}

async function getCollectionData(modalityId: string) {
  const modalityRef = doc(db, "modalities", modalityId);
  const modalityDoc = await getDoc(modalityRef);

  if (!modalityDoc.exists()) {
    toast.error("Modalidade não encontrada!");
    return [];
  }

  const q = query(
    collection(db, "matches"),
    where("modality", "==", modalityRef)
  );
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(async (doc1) => {
    const data = doc1.data();

    const team1Data = data.team_1?.team_id
      ? (await getDoc(doc(db, "teams", data.team_1.team_id.id))).data()
      : null;

    const team2Data = data.team_2?.team_id
      ? (await getDoc(doc(db, "teams", data.team_2.team_id.id))).data()
      : null;

    const championshipData = data.championship
      ? (await getDoc(doc(db, "championships", data.championship.id))).data()
      : null;

    return {
      id: doc1.id,
      ...data,
      team_1: {
        ...data.team_1,
        team_data: team1Data,
      },
      team_2: {
        ...data.team_2,
        team_data: team2Data,
      },
      championship: championshipData,
    };
  });

  const results = await Promise.all(documents);
  return results;
}

async function getChampionships() {
  const championshipsRef = collection(db, "championships");
  const championshipsSnapshot = await getDocs(championshipsRef);
  return championshipsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Championship[];
}

export default function NewGame({
  data,
  matches,
  championships,
}: {
  data: Modality;
  matches: Matche[];
  championships: Championship[];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [showUncompleted, setShowUncompleted] = useState<boolean>(false);
  const [matchet, setMatches] = useState<Matche[]>(matches);
  const [selectedChampionship, setSelectedChampionship] = useState<string>("");

  // Função para aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      const filteredMatches = matches.filter((match) => {
        const matchDate = new Date(`${match.date}T${match.time}`);
        const isCompleted =
          match.team_1?.score !== "" && match.team_2?.score !== "";
        const isUncompleted = !isCompleted;

        const matchesDateFilter =
          (startDate === "" || matchDate >= new Date(`${startDate}T00:00`)) &&
          (endDate === "" || matchDate <= new Date(`${endDate}T23:59`));

        const matchesStatusFilter =
          (!showCompleted || isCompleted) &&
          (!showUncompleted || isUncompleted);

        const matchesChampionshipFilter =
          selectedChampionship === "" ||
          // @ts-ignore
          match.championship?.id === selectedChampionship;

        return (
          matchesDateFilter && matchesStatusFilter && matchesChampionshipFilter
        );
      });

      setMatches(filteredMatches);
    };

    applyFilters();
  }, [
    startDate,
    endDate,
    showCompleted,
    showUncompleted,
    selectedChampionship,
    matches,
  ]);

  // Handlers para atualizar os estados dos filtros
  function handleStartDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setStartDate(event.target.value);
  }

  function handleEndDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEndDate(event.target.value);
  }

  function handleCompletedChange(event: React.ChangeEvent<HTMLInputElement>) {
    setShowCompleted(event.target.checked);
  }

  function handleUncompletedChange(event: React.ChangeEvent<HTMLInputElement>) {
    setShowUncompleted(event.target.checked);
  }

  function handleChampionshipChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setSelectedChampionship(event.target.value);
  }

  function toggleMoreInfo(matchId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [matchId]: !prevState[matchId],
    }));
  }

  async function popup(MatcheId: string) {
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "matches", MatcheId));
        toast.success("Jogo excluído com sucesso!");

        const updatedMatches = matchet.filter((m) => m.id !== MatcheId);
        setMatches(updatedMatches);
        window.location.reload();
      } catch (error) {
        toast.error("Erro ao excluir jogo.");
        console.error(error);
      }
    }
  }

  return (
    <>
      <HomeButton />
      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Jogos</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGO</p>
              <Link href={{ pathname: "/formGame", query: { mdl: data.id } }}>
                <img
                  className={styles.crudIcon}
                  src="./assets/novo.png"
                  alt=""
                />
              </Link>
            </div>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.dataInfon}>
              Campeonato:
              <select
                value={selectedChampionship}
                onChange={handleChampionshipChange}
              >
                <option value="">Todos os Campeonatos</option>
                {championships.map((championship) => (
                  <option key={championship.id} value={championship.id}>
                    {championship.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.filterContainer}>
            <label className={styles.dataInfon}>
              Data Início:
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </label>

            <label className={styles.dataInfon}>
              Data Fim:
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </label>
          </div>

          <label className={styles.dataInfon}>
            Mostrar apenas Concluídos:
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={handleCompletedChange}
            />
          </label>

          <label className={styles.dataInfon}>
            Mostrar apenas Não Concluídos:
            <input
              type="checkbox"
              checked={showUncompleted}
              onChange={handleUncompletedChange}
            />
          </label>

          {matchet.map((matche) => (
            <React.Fragment key={matche.id}>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <div className={styles.Game}>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_1?.team_data?.logo ||
                          "/undefined-team.png"
                        }
                        alt="Team 1 Logo"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.Scoreboard}>
                      <h2>{matche.team_1?.score || ""}</h2>
                      <h1>X</h1>
                      <h2>{matche.team_2?.score || ""}</h2>
                    </div>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_2?.team_data?.logo ||
                          "/undefined-team.png"
                        }
                        alt="Team 2 Logo"
                        width={60}
                        height={60}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.crudGroup}>
                  <img
                    id={`moreInfoButton_${matche.id}`}
                    className={styles.crudIcon}
                    src="./assets/detalhes.png"
                    alt=""
                    onClick={() => toggleMoreInfo(matche.id)}
                  />
                  <Link
                    href={{ pathname: `/editGame`, query: { id: matche.id } }}
                  >
                    <img
                      className={styles.crudIcon}
                      src="./assets/editar.png"
                      alt=""
                    />
                  </Link>
                  <img
                    className={styles.crudIcon}
                    src="./assets/excluir.png"
                    alt=""
                    onClick={() => popup(matche.id)}
                  />
                </div>
              </div>

              <div
                id={`moreInfo_${matche.id}`}
                className={`${styles.moreInfo} ${
                  moreInfoVisible[matche.id] ? "" : styles.hidden
                }`}
              >
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Horario</p>
                  <p className={styles.dataInfo}>{matche.time}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Local</p>
                  <p className={styles.dataInfo}>{matche.venue}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Data</p>
                  <p className={styles.dataInfo}>{matche.date}</p>
                </div>

                {matche.team_1 ? (
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Time 1</p>
                    <p className={styles.dataInfo}>
                      {matche.team_1.team_data?.name}
                    </p>
                  </div>
                ) : (
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Próximo Time 1</p>
                    <p className={styles.dataInfo}>{matche.next_team_1}</p>
                  </div>
                )}

                {matche.team_2 ? (
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Time 2</p>
                    <p className={styles.dataInfo}>
                      {matche.team_2.team_data?.name}
                    </p>
                  </div>
                ) : (
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Próximo Time 2</p>
                    <p className={styles.dataInfo}>{matche.next_team_2}</p>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <button className={styles.back} onClick={() => router.back()}>
          Voltar
        </button>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const mdl = query.mdl as string;

  const matches = await getCollectionData(mdl);
  const championships = await getChampionships();

  return {
    props: {
      data: { id: mdl },
      matches: JSON.parse(JSON.stringify(matches)),
      championships: JSON.parse(JSON.stringify(championships)),
    },
  };
}
