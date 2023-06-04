import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../../components/Header';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next';
import { toast } from 'react-toastify';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from '@firebase/firestore';
import { db } from '@/firebase';




async function getCollectionData(modalityId:string) {

  console.log("getCollectionData")

  const collectionRef = collection(db, 'modalities');
  const modalityRef = await getModalityReference(modalityId)

  if (!modalityRef) {
     toast.success('Modalidade não encontrado!');
    return;
  }

  console.log("players -- buscar jogadores")
  //console.log(modalityRef)

  const q = query(collection(db, "championships"), where('modality', '==', modalityRef));
  //const q = query(collection(db, "modalities"))
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(doc => {
    const data = doc.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));
    return {
      id: doc.id,
      ...jsonSerializableData,
    };
  });

  if (documents.length > 0) {
    console.log("documentos encontrados")
  }
  return documents;
}


async function getModalityReference(modalityId:string) {

  // buscar esportes
  console.log("buscar esportes -"+modalityId)
  const sportsCollection = 'modalities';
  const sportRef = doc(db, sportsCollection,modalityId);
  const sportDoc = await getDoc(sportRef);

  // console.log("sportDoc")
  // console.log(sportDoc)

  if (sportDoc.exists()) {
      console.log("Sucesso ao buscar a modalidade -"+modalityId)

    return sportRef;
  } else {
    toast.error('Esporte não encontrado!');
    return null;
  }
}


interface Modality{
  id:string,
  name:string,
}

interface ChampionShip {
  id: string;
  logo: string;
  name: string;
}



export default function NewChampionship({ data, championships }: { data: Modality, championships: [ChampionShip] }) {

  const [moreInfoVisible, setMoreInfoVisible] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  function toggleMoreInfo(championshipId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [championshipId]: !prevState[championshipId],
    }));
  }

  function HandleBackButtonClick() {
    window.history.back();
  }

  let championshipst: ChampionShip[] = [];

  async function popup(championshipId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {
        await deleteDoc(doc(db, 'championships', championshipId));
        toast.success('Campeonato excluído com sucesso!');

        const updatedChampionships = championships.filter((championship) => championship.id !== championshipId);
        championshipst = updatedChampionships;
        window.location.reload();
      } catch (erro) {
        toast.error('Erro ao excluir campeonato.');
        console.error(erro);
      }
    } else {
      // Ação a ser executada se o usuário clicar em "Não" ou fechar a caixa de diálogo
    }
  }

  return (
    <>
      <Header></Header>

      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Campeonatos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONATO</p>
              <Link href={{ pathname: '/formChampionship', query: { mdl: data.id } }}>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>
          {championships.map((championship) => (
            <>
              <div className={styles.newTeam}>
                <div className={styles.NameGroup}>
                  <img className={`${styles.modalityIcon} ${styles.newLogoAvatarListItem}`} src={championship.logo || "./assets/avatar.jpg"} alt="" />
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
                  <Link href={{ pathname: `/editChampionship`, query: { id: championship.id } }}>
                  <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
                  </Link>
                  <img className={styles.crudIcon} src="./assets/excluir.png" alt="" onClick={() => popup(championship.id)} />
                </div>
              </div>

              <div id={`moreInfo_${championship.id}`} className={`${styles.moreInfo} ${moreInfoVisible[championship.id] ? '' : styles.hidden}`}>
                <div className={styles.line}>
                  <p className={styles.dataInfo}>Nome:</p>
                  <p className={styles.dataInfo}>{championship.name}</p>
                </div>

                <div className={styles.line}>
                  <p className={styles.dataInfo}>info</p>
                  <p className={styles.dataInfo}>dados</p>
                </div>
                
              </div>
            </>
          ))}
        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}

export async function getServerSideProps(context:GetServerSidePropsContext) {
  const { query } = context;
  const {mdl} = query;
  console.log("mdl")
  console.log(mdl)

   let modalityId: string = '';
  if (typeof mdl === 'string') {
    modalityId = mdl;
  } else if (Array.isArray(modalityId)) {
    modalityId = modalityId.join(',');
  }
  console.log("modalityId")
  console.log(modalityId)

   const championships = await getCollectionData(modalityId);

  return {
    props: {
      data:{id:mdl},
     championships: championships
    },
  };
}



