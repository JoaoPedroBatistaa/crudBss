import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

import Link from 'next/link';
import { useState } from 'react';
import { getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { collection, db, doc, getDoc } from '@/firebase';

import { toast } from 'react-toastify';
import { GetServerSidePropsContext } from 'next';

async function getCollectionData(modalityId: string) {
  const collectionRef = collection(db, 'modalities');
  const modalityRef = await getModalityReference(modalityId);

  if (!modalityRef) {
    toast.success('Modalidade não encontrada!');
    return;
  }

  const q = query(collection(db, 'news'), where('modality', '==', modalityRef));
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map((doc1) => {
    const data = doc1.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));

    return {
      id: doc1.id,
      ...jsonSerializableData,
    };
  });

  if (documents.length > 0) {
    console.log('Documentos encontrados');
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

export default function NewNews({ data, news }: { data: Modality; news: News[] }) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{ [key: string]: boolean }>({});
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

  const [newsData, setNewsData] = useState<News[]>(news); // Use state to store the news data

  async function popup(newsId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {
        await deleteDoc(doc(db, 'news', newsId)); // Use the correct newsId to delete the document
        toast.success('Notícia excluída com sucesso!');

        const updatedNews = newsData.filter((newItem) => newItem.id !== newsId);
        setNewsData(updatedNews);
        window.location.reload();
      } catch (error) {
        toast.error('Erro ao excluir notícia.');
        console.error(error);
      }
    }
  }

  return (
    <>
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

          {newsData.map((newItem) => (
            <>
            <div className={styles.newTeam} key={newItem.id}>
              <div className={styles.NameGroup}>
                <h1 className={styles.newTeamName}>{newItem.title}</h1>
              </div>

              <div className={styles.crudGroup}>
                <img
                  id={`moreInfoButton_${newItem.id}`}
                  className={styles.crudIcon}
                  src="./assets/detalhes.png"
                  alt=""
                  onClick={() => toggleMoreInfo(newItem.id)}
                />
                <Link href={{ pathname: `/editNews`, query: { id: newItem.id } }}>
                <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
                </Link>
                <img
                  className={styles.crudIcon}
                  src="./assets/excluir.png"
                  alt=""
                  onClick={() => popup(newItem.id)}
                />
              </div>
              </div>

                <div id={`moreInfo_${newItem.id}`}className={`${styles.moreInfo} ${moreInfoVisible[newItem.id] ? '' : styles.hidden}`}>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Manchete</p>
                    <p className={styles.dataInfo}>{newItem.title}</p>
                  </div>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Descrição</p>
                    <p className={styles.dataInfo}>{newItem.description}</p>
                  </div>
                  
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Data</p>
                    <p className={styles.dataInfo}>{newItem.date}</p>
                  </div>
                                    
                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Imagem da Noticia</p>
                    <img className={`${styles.modalityIcon} 
                    ${styles.newImageItem}`} 
                    src={newItem.image} alt="" />
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
  } else if (Array.isArray(modalityId)) {
    modalityId = modalityId.join(',');
  }

  const news = await getCollectionData(modalityId);

  return {
    props: {
      data: { id: mdl },
      news: news,
    },
  };
}
