import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../../components/Header';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next';
import { toast } from 'react-toastify';
import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from '@firebase/firestore';
import { db } from '@/firebase';

interface Modality {
  id: string;
  name: string;
}

interface News {
  id: string;
  image: string;
  title: string;
  description: string;
  date: string;
}

async function getCollectionData(modalityId: string) {

  console.log("getCollectionData")

  const collectionRef = collection(db, 'modalities');
  const modalityRef = await getModalityReference(modalityId);

  if (!modalityRef) {
    toast.success('Modalidade não encontrada!');
    return;
  }

  const q = query(
    collection(db, 'news'), 
    where('modality', '==', modalityRef)
    );

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
    console.log('Documentos encontrados');
  }
  else {
    console.log("Teams não encontrados")
  }
  return documents;
}

async function getModalityReference(modalityId: string) {
  const sportsCollection = 'modalities';
  const sportRef = doc(db, sportsCollection, modalityId);
  const sportDoc = await getDoc(sportRef);

  if (sportDoc.exists()) {
    console.log('Sucesso ao buscar a modalidade - ' + modalityId);
    return sportRef;
  } else {
    toast.error('Esporte não encontrado!');
    return null;
  }
}

export default function NewNews({ data, news }: { data: Modality; news: News[] }) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{ [key: string]: boolean }>({});
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
      pathname: '/Categories',
      query: { mdl: data.id },
    });
  }

  async function popup(newsId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {
        await deleteDoc(doc(db, 'news', newsId));
        toast.success('Notícia excluída com sucesso!');

        const updatedNews = newsData.filter((newItem) => newItem.id !== newsId); // Update the newsData state
        setNewsData(updatedNews);
        window.location.reload();
      } catch (error) {
        toast.error('Erro ao excluir notícia.');
        console.error(error);
      }
    }
    setReloadData(true);
  }

  return (
    <>
      <Header></Header>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Notícias</h1>
            <div className={styles.new}>
              <p className={styles.newTitle}>NOVA NOTÍCIA</p>
              <Link href={{ pathname: '/formNews', query: { mdl: data.id } }}>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
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
                  <Link href={{ pathname: `/editNews`, query: { id: news.id } }}>
                    <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
                  </Link>
                  <img
                    className={styles.crudIcon}
                    src="./assets/excluir.png"
                    alt=""
                    onClick={() => popup(news.id)}
                  />
                </div>
              </div>

              <div id={`moreInfo_${news.id}`} className={`${styles.moreInfo} ${moreInfoVisible[news.id] ? '' : styles.hidden}`}>
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Manchete:</p>
                  <p className={styles.dataInfo}>{news.title}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Descrição:</p>
                  <p className={styles.dataInfo}>{news.description}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Data:</p>
                  <p className={styles.dataInfo}>{news.date}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>Imagem da Notícia:</p>
                  <img className={styles.newImageItem} src={news.image} alt="" />
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

  let modalityId: string = '';
  if (typeof mdl === 'string') {
    modalityId = mdl;
  } else if (Array.isArray(mdl)) {
    modalityId = mdl.join(',');
  }

  const news = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      news: news
    },
  };
}