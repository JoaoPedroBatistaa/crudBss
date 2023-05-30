import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

import Link from 'next/link';
import { useState } from 'react';
import {  getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { collection, db, doc, getDoc } from '@/firebase';

import { toast } from 'react-toastify';
import { GetServerSidePropsContext } from 'next';



async function getCollectionData(modalityId: string) {

  console.log("getCollectionData")

  const collectionRef = collection(db, 'modalities');
  const modalityRef = await getModalityReference(modalityId)

  if (!modalityRef) {
    toast.success('Modalidade não encontrado!');
    return;
  }

  console.log("players -- buscar jogadores")
  //console.log(modalityRef)

  const q = query(collection(db, "matches"), where('modality', '==', modalityRef));
  //const q = query(collection(db, "modalities"))
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(async (doc1) => {
    const data = doc1.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));

    // Fetch team data using team_id
    const team1Id:string = jsonSerializableData.team_1.team_id;
    console.log("team1Id")
    console.log(team1Id)

    // const team1DocRef =await getTeamReference(team1Id)
    // const team1Doc = await getDoc(team1DocRef);
    const team1Doc = await getDoc(doc(db, 'teams', team1Id.toString()));
    const team1Data = team1Doc.exists() ? team1Doc.data() : null;

     // Convert createdAt to a serializable format
  if (team1Data && team1Data.createdAt && team1Data.createdAt.toMillis) {
    team1Data.createdAt = team1Data.createdAt.toMillis();
  }


    const team2Id:string = jsonSerializableData.team_2.team_id;
       console.log("team2Id")
    console.log(team2Id)
    const team2Doc = await getDoc(doc(db, 'teams', team2Id.toString()));
    const team2Data = team2Doc.exists() ? team2Doc.data() : null;

      if (team2Data && team2Data.createdAt && team2Data.createdAt.toMillis) {
    team2Data.createdAt = team2Data.createdAt.toMillis();
  }

    return {
      id: doc1.id,
      ...jsonSerializableData,
      team_1: {
        ...jsonSerializableData.team_1,
        team_data: team1Data,
      },
      team_2: {
        ...jsonSerializableData.team_2,
        team_data: team2Data,
      },
    };
  });

  // Wait for all team data to be fetched
  const results = await Promise.all(documents);

  // console.log(results)

  if (results.length > 0) {
    console.log('documentos encontrados');
  }
  return results;
}

async function getTeamReference(teamId:string){

   console.log("buscar team -" + teamId)
  const colletion = 'teams';

  console.log(teamId)
  const objectRef =  doc(db, "teams", teamId.toString());
  const objDoc = await getDoc(objectRef);

  // console.log("sportDoc")
  // console.log(sportDoc)

  if (objDoc.exists()) {
    console.log("Sucesso ao buscar o time -" + teamId)

    return objectRef;
  } else {
    toast.error('Esporte não encontrado!');
    return null;
  }

}


async function getModalityReference(modalityId: string) {

  // buscar esportes
  console.log("buscar esportes -" + modalityId)
  const sportsCollection = 'modalities';
  const sportRef = doc(db, sportsCollection, modalityId);
  const sportDoc = await getDoc(sportRef);

  // console.log("sportDoc")
  // console.log(sportDoc)

  if (sportDoc.exists()) {
    console.log("Sucesso ao buscar a modalidade -" + modalityId)

    return sportRef;
  } else {
    toast.error('Esporte não encontrado!');
    return null;
  }
}
interface Modality {
  id: string,
  name: string,
}

interface Matche {
  id: string;
  team_1: {
    score:number;
    team_id: string;
    team_data: Team; // Added property to store team details
  };
  team_2: {
    score:number;
    team_id: string;
    team_data: Team; // Added property to store team details
  };
  time:string;
  venue:String;

}

interface Team {
  id:string;
  name:string;
  logo:string;
}


export default function NewGame({data, matches }: { data:Modality,matches: [Matche] }) {

  const [moreInfoVisible, setMoreInfoVisible] = useState(false);
  const router = useRouter();

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

  const [matchet, setMatches] = useState<Matche[]>([]); 

  async function popup(MatcheId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {

        await deleteDoc(doc(db, 'matches', MatcheId));
        toast.success('Jogo excluído com sucesso!');

        const equipesAtualizadas = matchet.filter(matchet => matchet.id !== MatcheId);
        setMatches(equipesAtualizadas);
        window.location.reload();
        
        
      } catch (erro) {
        toast.error('Erro ao excluir jogo.');
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
            <h1 className={styles.title}>Jogos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGO</p>
              <Link href={{ pathname: '/formGame', query: { mdl: data.id} }}>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>

          {matches.map(matche =>(
            <>
          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <Image 
                  className={styles.modalityIcon,styles.teamAvatarListItem} 
                  src={matche.team_1.team_data?.logo == null ? "/assets/team1.png":matche.team_1.team_data.logo} 
                  alt="" 
                  width={60}
                  height={60}
                  />
                <h1>X</h1>
                <Image 
                  className={styles.modalityIcon,styles.teamAvatarListItem} 
                  src={matche.team_1.team_data?.logo == null ? "/assets/team1.png":matche.team_2.team_data.logo}  
                  alt="" 
                   width={60}
                  height={60}
                  />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img id='moreInfoButton' className={styles.crudIcon} src="./assets/detalhes.png" alt="" onClick={toggleMoreInfo} />
              <Link href='/editGame'>
                <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              </Link>
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" onClick={() => popup(matche.id)} />
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

          ))
        }



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

   const matches = await getCollectionData(modalityId);

  return {
    props: {
      data:{id:mdl},
      matches:matches
    },
  };
}

