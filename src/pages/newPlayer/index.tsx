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
  name: string;
}

interface Player {
  id: string;
  totalScore: Number;
  instagram?: string;
  mpvOfTheGames: Number;
  mvpOfTheChampionship: Number;
  name: string;
  photo?: string;
  threePointers: Number;
  topScorersOfTheChampionship: Number;
  topScorersOfTheGame: Number;
  kingplayer: Number;
  position: string;
  cpf: string;
  birthDate: string;
}

async function getCollectionData(modalityId: string) {
  console.log("getCollectionData");

  const collectionRef = collection(db, "modalities");
  const modalityRef = await getModalityReference(modalityId);

  if (!modalityRef) {
    toast.success("Modalidade não encontrado!");
    return;
  }

  console.log("players -- buscar jogadores");
  //console.log(modalityRef)

  const q = query(
    collection(db, "players"),
    where("modality", "==", modalityRef)
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
    console.log("documentos encontrados");
  }
  return documents;
}

async function getModalityReference(modalityId: string) {
  // buscar esportes
  console.log("buscar esportes -" + modalityId);
  const sportsCollection = "modalities";
  const sportRef = doc(db, sportsCollection, modalityId);
  const sportDoc = await getDoc(sportRef);

  // console.log("sportDoc")
  // console.log(sportDoc)

  if (sportDoc.exists()) {
    console.log("Sucesso ao buscar a modalidade -" + modalityId);

    return sportRef;
  } else {
    toast.error("Esporte não encontrado!");
    return null;
  }
}

interface PlayerProps {
  player: Player;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const [moreInfoVisible, setMoreInfoVisible] = useState(false);

  function toggleMoreInfo() {
    setMoreInfoVisible(!moreInfoVisible);
  }

  function calculateAge(birthDate: string): number {
    const today = new Date();
    const birthDateObject = new Date(birthDate);
    let age = today.getFullYear() - birthDateObject.getFullYear();
    const month = today.getMonth() - birthDateObject.getMonth();
    if (
      month < 0 ||
      (month === 0 && today.getDate() < birthDateObject.getDate())
    ) {
      age--;
    }
    return age;
  }

  const [playerData, setPlayerData] = useState<Player[]>([player]); // Use state to store the player data as an array

  async function popup(playerId: string) {
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "players", playerId));
        toast.success("Jogador excluído com sucesso!");

        // Update the playerData state by filtering out the deleted player
        const updatedPlayers = playerData.filter(
          (player) => player.id !== playerId
        );
        setPlayerData(updatedPlayers);

        window.location.reload();
      } catch (error) {
        toast.error("Erro ao excluir jogador.");
        console.error(error);
      }
    }
  }

  return (
    <>
      {/* <Header></Header> */}
      <HomeButton></HomeButton>

      <div className={styles.newTeam}>
        <div className={styles.NameGroup}>
          <img
            className={`${styles.modalityIcon} ${styles.newPalyerAvatarListItem}`}
            src={player.photo || "./assets/avatar.jpg"}
            alt=""
          />
          <h1 className={styles.newTeamName}>{player.name}</h1>
        </div>

        <div className={styles.crudGroup}>
          <img
            id="moreInfoButton"
            className={styles.crudIcon}
            src="./assets/detalhes.png"
            alt=""
            onClick={toggleMoreInfo}
          />
          <Link href={{ pathname: `/editPlayer`, query: { id: player.id } }}>
            <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
          </Link>
          <img
            className={styles.crudIcon}
            src="./assets/excluir.png"
            alt=""
            onClick={() => popup(player.id)}
          />
        </div>
      </div>

      {moreInfoVisible && (
        <div id="moreInfo" className={styles.moreInfo}>
          <div className={styles.line}>
            <p className={styles.dataInfo}>Nome:</p>
            <p className={styles.dataInfo}>{player.name}</p>
          </div>

          <div className={styles.line}>
            <p className={styles.dataInfo}>Instagram</p>
            <p className={styles.dataInfo}>{player.instagram}</p>
          </div>

          <div className={styles.line}>
            <p className={styles.dataInfo}>Posição</p>
            <p className={styles.dataInfo}>{player.position}</p>
          </div>

          <div className={styles.line}>
            <p className={styles.dataInfo}>CPF</p>
            <p className={styles.dataInfo}>{player.cpf}</p>
          </div>

          <div className={styles.line}>
            <p className={styles.dataInfo}>Idade</p>
            <p className={styles.dataInfo}>{calculateAge(player.birthDate)}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default function NewPlayer({
  data,
  players,
}: {
  data: Modality;
  players: Player[];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function toggleMoreInfo() {
    setMoreInfoVisible(!moreInfoVisible);
  }
  function HandleBackButtonClick() {
    router.push({
      pathname: "/Categories",
      query: { mdl: data.id },
    });
  }

  return (
    <>
      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Jogadores</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGADOR</p>
              <Link href={{ pathname: "/formPlayer", query: { mdl: data.id } }}>
                <img
                  className={styles.crudIcon}
                  src="./assets/novo.png"
                  alt=""
                />
              </Link>
            </div>
          </div>

          <input
            type="text"
            placeholder="Pesquise por jogadores"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          {filteredPlayers.map((player) => (
            <Player key={player.id} player={player} />
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

  const players = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      players: players,
    },
  };
}
