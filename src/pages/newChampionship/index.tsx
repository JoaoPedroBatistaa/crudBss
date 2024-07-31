import { db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import HomeButton from "../../components/HomeButton";
import styles from "./styles.module.css";

async function getCollectionData(modalityId: string) {
  console.log("getCollectionData");

  const collectionRef = collection(db, "modalities");
  const modalityRef = await getModalityReference(modalityId);

  if (!modalityRef) {
    toast.error("Modalidade não encontrada!");
    return [];
  }

  console.log("players -- buscar jogadores");

  const q = query(
    collection(db, "championships"),
    where("modality", "==", modalityRef)
  );
  const querySnapshot = await getDocs(q);

  const documents = querySnapshot.docs.map((doc) => {
    console.log("Doc ID:", doc.id); // Log para verificar cada ID de documento
    const data = doc.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));
    return {
      id: doc.id, // Certifique-se de incluir o ID do documento
      ...jsonSerializableData,
    };
  });

  if (documents.length > 0) {
    console.log("Documentos encontrados");
  } else {
    console.log("Nenhum documento encontrado");
  }
  return documents;
}

async function getModalityReference(modalityId: string) {
  console.log("buscar esportes -", modalityId);
  const sportsCollection = "modalities";
  const sportRef = doc(db, sportsCollection, modalityId);
  const sportDoc = await getDoc(sportRef);

  if (sportDoc.exists()) {
    console.log("Sucesso ao buscar a modalidade -", modalityId);
    return sportRef;
  } else {
    toast.error("Esporte não encontrado!");
    return null;
  }
}

interface Modality {
  id: string;
  name: string;
}

interface ChampionShip {
  id: string;
  logo: string;
  name: string;
  criterion: string;
  description: string;
}

export default function NewChampionship({
  data,
  championships,
}: {
  data: Modality;
  championships: ChampionShip[];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  useEffect(() => {
    console.log("Championships State:", championships); // Log para verificar o estado
  }, [championships]);

  function toggleMoreInfo(championshipId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [championshipId]: !prevState[championshipId],
    }));
  }

  function HandleBackButtonClick() {
    router.push({
      pathname: "/Categories",
      query: { mdl: data.id },
    });
  }

  async function popup(championshipId: string) {
    console.log("Attempting to delete championship with ID:", championshipId);

    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        // Certifique-se de que o championshipId seja uma string válida e não esteja vazio
        if (!championshipId || typeof championshipId !== "string") {
          toast.error("ID do campeonato inválido.");
          console.error("Invalid championship ID:", championshipId);
          return;
        }

        console.log(
          "Deleting document from Firestore with ID:",
          championshipId
        );
        await deleteDoc(doc(db, "championships", championshipId));
        toast.success("Campeonato excluído com sucesso!");

        console.log(
          "Document deleted successfully. Filtering remaining championships."
        );
        const updatedChampionships = championships.filter(
          (championship) => championship.id !== championshipId
        );

        console.log("Updated championships list:", updatedChampionships);
        // Atualizar estado dos campeonatos após exclusão
        setMoreInfoVisible((prevState) => {
          const newState = { ...prevState };
          delete newState[championshipId];
          return newState;
        });
        // Use `router.reload()` to refresh the page or manually update the state.
        router.reload();
      } catch (error) {
        console.error("Error while deleting championship:", error);
        toast.error("Erro ao excluir campeonato.");
      }
    } else {
      console.log("User canceled the delete operation.");
    }
  }

  return (
    <>
      <Header />
      <HomeButton />

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Campeonatos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONATO</p>
              <Link
                href={{
                  pathname: "/formChampionship",
                  query: { mdl: data.id },
                }}
              >
                <img
                  className={styles.crudIcon}
                  src="./assets/novo.png"
                  alt=""
                />
              </Link>
            </div>
          </div>
          {championships.map((championship) => (
            <div key={championship.id} className={styles.newTeam}>
              <div className={styles.NameGroup}>
                <img
                  className={`${styles.modalityIcon} ${styles.newLogoAvatarListItem}`}
                  src={championship.logo || "./assets/avatar.jpg"}
                  alt=""
                />
                <h1 className={styles.newTeamName}>{championship.name}</h1>
              </div>

              <div className={styles.crudGroup}>
                <img
                  id={`moreInfoButton_${championship.id}`}
                  className={styles.crudIcon}
                  src="./assets/detalhes.png"
                  alt=""
                  onClick={() => toggleMoreInfo(championship.id)}
                />
                <Link
                  href={{
                    pathname: `/editChampionship`,
                    query: { id: championship.id },
                  }}
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
                  onClick={() => popup(championship.id)}
                />
              </div>

              <div
                id={`moreInfo_${championship.id}`}
                className={`${styles.moreInfo} ${
                  moreInfoVisible[championship.id] ? "" : styles.hidden
                }`}
              >
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Nome:</p>
                  <p className={styles.dataInfo}>{championship.name}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Criterio</p>
                  <p className={styles.dataInfo}>{championship.criterion}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Descrição</p>
                  <p className={styles.description}>
                    {championship.description}
                  </p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>info</p>
                  <p className={styles.dataInfo}>dados</p>
                </div>
              </div>
            </div>
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
  } else if (Array.isArray(mdl)) {
    modalityId = mdl.join(",");
  }
  console.log("modalityId");
  console.log(modalityId);

  const championships = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      championships: championships,
    },
  };
}
