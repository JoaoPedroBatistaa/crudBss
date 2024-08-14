import { collection, db, doc, getDoc } from "@/firebase";
import { deleteDoc, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
  team_1: {
    score: string;
    team_id: string;
    team_data: Team;
  };
  team_2: {
    score: string;
    team_id: string;
    team_data: Team;
  };
  time: string;
  venue: String;
  date: string;
}

interface Team {
  id: string;
  name: string;
  logo: string;
}

async function getCollectionData(modalityId: string) {
  const collectionRef = collection(db, "modalities");
  const modalityRef = doc(db, "modalities", modalityId);
  const modalityDoc = await getDoc(modalityRef);

  if (!modalityDoc.exists()) {
    toast.error("Modalidade não encontrada!");
    return;
  }

  const q = query(
    collection(db, "matches"),
    where("modality", "==", modalityRef)
  );
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(async (doc1) => {
    const data = doc1.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));

    const team1Id = jsonSerializableData.team_1.team_id._key.path.segments[6];
    const team1Doc = await getDoc(doc(db, "teams", team1Id));
    const team1Data = team1Doc.exists() ? team1Doc.data() : null;

    if (team1Data && team1Data.createdAt && team1Data.createdAt.toMillis) {
      team1Data.createdAt = team1Data.createdAt.toMillis();
    }

    const team2Id = jsonSerializableData.team_2.team_id._key.path.segments[6];
    const team2Doc = await getDoc(doc(db, "teams", team2Id));
    const team2Data = team2Doc.exists() ? team2Doc.data() : null;

    if (team2Data && team2Data.createdAt && team2Data.createdAt.toMillis) {
      team2Data.createdAt = team2Data.createdAt.toMillis();
    }

    jsonSerializableData.team_1.team_data = team1Data;
    jsonSerializableData.team_2.team_data = team2Data;

    return {
      id: doc1.id,
      ...jsonSerializableData,
    };
  });

  const results = await Promise.all(documents);

  if (results.length > 0) {
    console.log("Documentos encontrados");
  }

  return results;
}

async function getModalityReference(modalityId: string) {
  console.log("buscar esportes -" + modalityId);
  const sportsCollection = "modalities";
  const sportRef = doc(db, sportsCollection, modalityId);
  const sportDoc = await getDoc(sportRef);

  if (sportDoc.exists()) {
    console.log("Sucesso ao buscar a modalidade -" + modalityId);
    return sportRef;
  } else {
    toast.error("Esporte não encontrado!");
    return null;
  }
}

export default function NewGame({
  data,
  matches,
}: {
  data: Modality;
  matches: Matche[];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [matchet, setMatches] = useState<Matche[]>(matches);

  function toggleMoreInfo(matchId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [matchId]: !prevState[matchId],
    }));
  }

  function HandleBackButtonClick() {
    router.push({
      pathname: "/Categories",
      query: { mdl: data.id },
    });
  }

  async function popup(MatcheId: string) {
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "matches", MatcheId));
        toast.success("Jogo excluído com sucesso!");

        const matchesAtualizadas = matchet.filter(
          (matchet) => matchet.id !== MatcheId
        );
        setMatches(matchesAtualizadas);
        window.location.reload();
      } catch (erro) {
        toast.error("Erro ao excluir jogo.");
        console.error(erro);
      }
    }
  }

  function compareDates(a: Matche, b: Matche) {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  }

  function handleStartDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setStartDate(event.target.value);
  }

  function handleEndDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEndDate(event.target.value);
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLInputElement>) {
    setShowCompleted(event.target.checked);
  }

  const filteredMatches = matches.filter((match) => {
    const matchDate = new Date(`${match.date}T${match.time}`);
    const isCompleted = match.team_1.score !== "" && match.team_2.score !== "";

    const matchesDateFilter =
      (startDate === "" || matchDate >= new Date(`${startDate}T00:00`)) &&
      (endDate === "" || matchDate <= new Date(`${endDate}T23:59`));

    const matchesStatusFilter = !showCompleted || isCompleted;

    return matchesDateFilter && matchesStatusFilter;
  });

  const matchesWithScore = filteredMatches.filter(
    (match) => match.team_1.score !== "" && match.team_2.score !== ""
  );
  const matchesWithoutScore = filteredMatches.filter(
    (match) => match.team_1.score === "" && match.team_2.score === ""
  );

  matchesWithScore.sort(compareDates);
  matchesWithoutScore.sort(compareDates);

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
              onChange={handleStatusChange}
            />
          </label>

          {matchesWithoutScore.map((matche) => (
            <React.Fragment key={matche.id}>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <div className={styles.Game}>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_1.team_data?.logo || "/assets/team1.png"
                        }
                        alt=""
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.Scoreboard}>
                      <h2>{matche.team_1.score}</h2>
                      <h1>X</h1>
                      <h2>{matche.team_2.score}</h2>
                    </div>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_2.team_data?.logo || "/assets/team1.png"
                        }
                        alt=""
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

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Time 1</p>
                  <p className={styles.dataInfo}>
                    {matche.team_1.team_data?.name}
                  </p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Time 2</p>
                  <p className={styles.dataInfo}>
                    {matche.team_2.team_data?.name}
                  </p>
                </div>
              </div>
            </React.Fragment>
          ))}

          {matchesWithScore.map((matche) => (
            <React.Fragment key={matche.id}>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <div className={styles.Game}>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_1.team_data?.logo || "/assets/team1.png"
                        }
                        alt=""
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className={styles.Scoreboard}>
                      <h2>{matche.team_1.score}</h2>
                      <h1>X</h1>
                      <h2>{matche.team_2.score}</h2>
                    </div>
                    <div className={styles.TeamLogo}>
                      <Image
                        src={
                          matche.team_2.team_data?.logo || "/assets/team1.png"
                        }
                        alt=""
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

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Time 1</p>
                  <p className={styles.dataInfo}>
                    {matche.team_1.team_data?.name}
                  </p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Time 2</p>
                  <p className={styles.dataInfo}>
                    {matche.team_2.team_data?.name}
                  </p>
                </div>
              </div>
            </React.Fragment>
          ))}
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

  let modalityId: string = "";
  if (typeof mdl === "string") {
    modalityId = mdl;
  } else if (Array.isArray(modalityId)) {
    modalityId = modalityId.join(",");
  }

  const matches = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      matches: matches,
    },
  };
}
