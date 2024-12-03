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
  year: string;
  criterion: string;
  description: string;
}

import { useMemo } from "react";

// Adicione esse estado e a lógica de filtro no componente
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
  const [selectedYear, setSelectedYear] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    console.log("Championships State:", championships); // Log para verificar o estado
  }, [championships]);

  // Extração de anos únicos
  const years = useMemo(() => {
    const allYears = championships
      .map((championship) => {
        if (championship.year) {
          return new Date(championship.year).getFullYear();
        }
        return null;
      })
      .filter((year) => year !== null); // Remove valores nulos
    return Array.from(new Set(allYears)); // Remove duplicados
  }, [championships]);

  // Campeonatos filtrados
  const filteredChampionships = useMemo(() => {
    if (!selectedYear) return championships;
    return championships.filter((championship) => {
      if (championship.year) {
        const year = new Date(championship.year).getFullYear();
        return year.toString() === selectedYear;
      }
      return false;
    });
  }, [selectedYear, championships]);

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
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "championships", championshipId));
        toast.success("Campeonato excluído com sucesso!");
        router.reload();
      } catch (error) {
        console.error("Error while deleting championship:", error);
        toast.error("Erro ao excluir campeonato.");
      }
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

          {/* Adicione o seletor de ano */}
          <div className={styles.filter}>
            <label htmlFor="yearFilter" className={styles.filterLabel}>
              Filtrar por ano:
            </label>
            <select
              id="yearFilter"
              className={styles.filterSelect}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Todos os anos</option>
              {years.map((year) => (
                // @ts-ignore
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {filteredChampionships.map((championship) => (
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
