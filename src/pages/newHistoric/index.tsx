import { db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
} from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
  name: string;
}

interface News {
  id: string;
  image: string;
  title: string;
}

async function getCollectionData() {
  const q = query(collection(db, "historic"));

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
    console.log("Documentos encontrados");
  } else {
    console.log("Teams não encontrados");
  }
  return documents;
}

export default function NewNews({
  data,
  news,
}: {
  data: Modality;
  news: News[];
}) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [newsData, setNewsData] = useState<News[]>(news); // Add the newsData state
  const [reloadData, setReloadData] = useState(false);
  const router = useRouter();

  function toggleMoreInfo(newsId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [newsId]: !prevState[newsId],
    }));
  }

  function HandleBackButtonClick() {
    router.push({
      pathname: "/Sports",
    });
  }

  async function popup(newsId: string) {
    if (window.confirm("Deseja mesmo excluir?")) {
      try {
        await deleteDoc(doc(db, "historic", newsId));
        toast.success("Patrocinador excluída com sucesso!");

        const updatedNews = newsData.filter((newItem) => newItem.id !== newsId); // Update the newsData state
        setNewsData(updatedNews);
        window.location.reload();
      } catch (error) {
        toast.error("Erro ao excluir notícia.");
        console.error(error);
      }
    }
    setReloadData(true);
  }

  return (
    <>
      <Header></Header>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Histórico</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONATO</p>
              <Link href={{ pathname: "/formHistoric" }}>
                <img
                  className={styles.crudIcon}
                  src="./assets/novo.png"
                  alt=""
                />
              </Link>
            </div>
          </div>

          {news.map((news) => (
            <>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <h1 className={styles.newTeamName}>{news.title}</h1>
                </div>

                <div className={styles.crudGroup}>
                  <img
                    id={`moreInfoButton_${news.id}`}
                    className={styles.crudIcon}
                    src="./assets/detalhes.png"
                    alt=""
                    onClick={() => toggleMoreInfo(news.id)}
                  />
                  <Link
                    href={{ pathname: `/editHistoric`, query: { id: news.id } }}
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
                    onClick={() => popup(news.id)}
                  />
                </div>
              </div>

              <div
                id={`moreInfo_${news.id}`}
                className={`${styles.moreInfo} ${
                  moreInfoVisible[news.id] ? "" : styles.hidden
                }`}
              >
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Manchete:</p>
                  <p className={styles.dataInfo}>{news.title}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Imagem da Notícia:</p>
                  <img
                    className={styles.newImageItem}
                    src={news.image}
                    alt=""
                  />
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
  const news = await getCollectionData();

  return {
    props: {
      news: news,
    },
  };
}
