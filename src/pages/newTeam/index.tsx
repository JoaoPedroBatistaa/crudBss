import { collection, db, doc, getDoc } from "@/firebase";
import { deleteDoc, getDocs, query, where } from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

interface Player {
  id: string;
  name: string;
  photo: string;
}

interface Team {
  id: string;
  logo: string;
  modality: string;
  name: string;
  squad: Player[];
  cnpj: string;
  responsibleCpf: string;
  responsibleName: string;
  instagram: string;
  whatsapp: string;
}

async function getCollectionData(modalityId: string) {
  const collectionRef = collection(db, "modalities");
  const modalityRef = await getModalityReference(modalityId);

  if (!modalityRef) {
    toast.error("Modalidade não encontrado!");
    return;
  }

  console.log("team -- buscar jogadores " + modalityRef);
  console.log(modalityRef.path);

  const q = query(
    collection(db, "teams"),
    where("modality", "==", modalityRef.path)
  );

  //const q = query(collection(db, "modalities"))
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));
    return {
      id: doc.id,
      ...jsonSerializableData,
    };
  });

  if (documents.length > 0) {
    console.log("teams encontrados");
  }
  return documents;
}

async function getModalityReference(modalityId: string) {
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

export default function NewTeam({
  data,
  teams,
}: {
  data: Modality;
  teams: [Team];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  function toggleMoreInfo(teamId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [teamId]: !prevState[teamId],
    }));
  }

  function HandleBackButtonClick() {
    router.push({
      pathname: "/Categories",
      query: { mdl: data.id },
    });
  }

  const [teamst, setTeams] = useState<Team[]>([]);

  async function popup(TeamId: string) {
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "teams", TeamId));
        toast.success("Equipe excluída com sucesso!");

        const equipesAtualizadas = teamst.filter((team) => team.id !== TeamId);
        setTeams(equipesAtualizadas);
        window.location.reload();
      } catch (erro) {
        toast.error("Erro ao excluir a equipe.");
        console.error(erro);
      }
    }
  }

  return (
    <>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Times</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO TIME</p>
              <Link
                href={{ pathname: "/FormNewTime", query: { mdl: data.id } }}
              >
                <img
                  className={styles.crudIcon}
                  src="./assets/novo.png"
                  alt=""
                />
              </Link>
            </div>
          </div>
          {teams.map((team) => (
            <>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <img
                    className={`${styles.modalityIcon} ${styles.newLogoAvatarListItem}`}
                    src={team.logo}
                    alt=""
                  />
                  <h1 className={styles.newTeamName}>{team.name}</h1>
                </div>
                <div className={styles.crudGroup}>
                  <img
                    id={`moreInfoButton_${team.id}`}
                    className={styles.crudIcon}
                    src="./assets/detalhes.png"
                    alt=""
                    onClick={() => toggleMoreInfo(team.id)}
                  />
                  <Link
                    href={{ pathname: `/editTeam`, query: { id: team.id } }}
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
                    onClick={() => popup(team.id)}
                  />
                </div>
              </div>
              <div
                id={`moreInfo_${team.id}`}
                className={`${styles.moreInfo} ${
                  moreInfoVisible[team.id] ? "" : styles.hidden
                }`}
              >
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Nome do Time</p>
                  <p className={styles.dataInfo}>{team.name}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Logo do time</p>
                  <img
                    className={`${styles.modalityIcon}
                  ${styles.newLogoAvatarListItem}`}
                    src={team.logo}
                    alt=""
                  />
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Instagram</p>
                  <p className={styles.dataInfo}>{team.instagram}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>CNPJ</p>
                  <p className={styles.dataInfo}>{team.cnpj}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Responsavel do time</p>
                  <p className={styles.dataInfo}>{team.responsibleName}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>CPF do Responsavel</p>
                  <p className={styles.dataInfo}>{team.responsibleCpf}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>WhatsApp do Responsavel</p>
                  <p className={styles.dataInfo}>{team.whatsapp}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Elenco</p>
                  <div className={styles.elencoList}>
                    {team.squad.map((player: Player) =>
                      player && player.name ? (
                        <p key={player.id} className={styles.dataInfo}>
                          {player.name}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </>
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
  console.log("mdl");
  console.log(mdl);

  let modalityId: string = "";
  if (typeof mdl === "string") {
    modalityId = mdl;
  } else if (Array.isArray(modalityId)) {
    modalityId = modalityId.join(",");
  }
  console.log("modalityId");
  console.log(modalityId);

  const teams = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      teams: teams,
    },
  };
}
