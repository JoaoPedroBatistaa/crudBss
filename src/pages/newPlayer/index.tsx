import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { collection, db, doc, getDoc } from '@/firebase';
import { toast } from 'react-toastify';
import { getDocs, query, where, deleteDoc } from '@firebase/firestore';


interface Modality{
  id:string,
  name:string,
}

interface Player{
  id:string,
  name:string,
  photo:string
}

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

  const q = query(collection(db, "players"), where('modality', '==', modalityRef));
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



export default function NewPlayer({data, players }: { data:Modality,players: [Player] }) {

  const [moreInfoVisible, setMoreInfoVisible] = useState(false);
  const router = useRouter();

  // console.log(data)
  // console.log(players)

  function toggleMoreInfo() {
    setMoreInfoVisible(!moreInfoVisible);
  }
  function HandleBackButtonClick() {
    window.history.back();
  }

  // function popup() {
  //   if (confirm('Deseja mesmo excluir?')) {
  //     // Ação a ser executada se o usuário clicar em "Sim"
  //   } else {
  //     // Ação a ser executada se o usuário clicar em "Não" ou fechar a caixa de diálogo
  //   }
  // }

  const [playert, setPlayers] = useState<Player[]>([]); 

  async function popup(PlayerId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {

        await deleteDoc(doc(db, 'players', PlayerId));
        toast.success('Jogador excluído com sucesso!');

        const equipesAtualizadas = playert.filter(playert => playert.id !== PlayerId);
        setPlayers(equipesAtualizadas);
        window.location.reload();
        
        
      } catch (erro) {
        toast.error('Erro ao excluir jogador.');
        console.error(erro);
      }
    } else {

    }
  }

  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Jogadores</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGADOR</p>
              <Link href={{ pathname: '/formPlayer', query: { mdl: data.id} }}>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>

          { players.map(player => (
            <>
            <div className={styles.newTeam}>
              <div className={styles.NameGroup}>
                <img 
                  className={styles.modalityIcon ,styles.newPalyerAvatarListItem} 
                  src={player.photo||"./assets/avatar.jpg" } 
                  alt="" 
                />
                <h1 className={styles.newTeamName}>{player.name}</h1>
              </div>

              <div className={styles.crudGroup}>
                <img id='moreInfoButton' className={styles.crudIcon} src="./assets/detalhes.png" alt="" onClick={toggleMoreInfo} />
                <Link href='/editPlayer'>
                  <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
                </Link>
                <img className={styles.crudIcon} src="./assets/excluir.png" alt="" onClick={() => popup(player.id)} />
              </div>
            </div>
       


          <div id='moreInfo' className={`${styles.moreInfo} ${moreInfoVisible ? '' : styles.hidden}`}>

            <div className={styles.line}>
              <p className={styles.dataInfo}>Info</p>
              <p className={styles.dataInfo}>dados</p>
            </div>
            <div className={styles.line}>
              <p className={styles.dataInfo}>info</p>
              <p className={styles.dataInfo}>dados</p>
            </div>
            <div className={styles.line}>
              <p className={styles.dataInfo}>info </p>
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

   const players = await getCollectionData(modalityId);

  return {
    props: {
      data:{id:mdl},
     players: players
    },
  };
}


