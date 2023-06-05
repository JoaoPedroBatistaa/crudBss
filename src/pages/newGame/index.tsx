import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { collection, db, doc, getDoc } from '@/firebase';

import { toast } from 'react-toastify';
import { GetServerSidePropsContext } from 'next';

interface Modality {
  id: string,
  name: string,
}

interface Matche {
  id: string;
  team_1: {
    score: number;
    team_id: string;
    team_data: Team; // Added property to store team details
  };
  team_2: {
    score: number;
    team_id: string;
    team_data: Team; // Added property to store team details
  };
  time: string;
  venue: String;
  date: string;
}

interface Team {
  id: string;
  name: string;
  logo: string;
}



async function getCollectionData(modalityId: string) {

  const collectionRef = collection(db, 'modalities');
  const modalityRef = doc(db, 'modalities', modalityId);
  const modalityDoc = await getDoc(modalityRef);

  if (!modalityDoc.exists()) {
    toast.error('Modalidade não encontrada!');
    return;
  }

  const q = query(collection(db, "matches"), where('modality', '==', modalityRef));
  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(async (doc1) => {
    const data = doc1.data();
    const jsonSerializableData = JSON.parse(JSON.stringify(data));

    const team1Id = jsonSerializableData.team_1.team_id;
    const team1Doc = await getDoc(doc(db, 'teams', team1Id.toString()));
    const team1Data = team1Doc.exists() ? team1Doc.data() : null;

    if (team1Data && team1Data.createdAt && team1Data.createdAt.toMillis) {
      team1Data.createdAt = team1Data.createdAt.toMillis();
    }

    console.log('Team 1 Data:', team1Data); // Verifica os dados da equipe 1.

    const team2Id = jsonSerializableData.team_2.team_id;
    const team2Doc = await getDoc(doc(db, 'teams', team2Id.toString()));
    const team2Data = team2Doc.exists() ? team2Doc.data() : null;

    if (team2Data && team2Data.createdAt && team2Data.createdAt.toMillis) {
      team2Data.createdAt = team2Data.createdAt.toMillis();
    }

    console.log(team1Doc);
    console.log(team2Doc);

    jsonSerializableData.team_1.team_data = team1Data;
    jsonSerializableData.team_2.team_data = team2Data;

    return {
      id: doc1.id,
      ...jsonSerializableData,
    };
  });

  const results = await Promise.all(documents);

  if (results.length > 0) {
    console.log('Documentos encontrados');
  }

  return results;
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

export default function NewGame({ data, matches }: { data: Modality; matches: Matche[] }) {
  const [moreInfoVisible, setMoreInfoVisible] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  function toggleMoreInfo(matchId: string) {
    setMoreInfoVisible((prevState) => ({
      ...prevState,
      [matchId]: !prevState[matchId],
    }));
  }

  function HandleBackButtonClick() {
    window.history.back();
  }

  const [matchet, setMatches] = useState<Matche[]>([]);

  async function popup(MatcheId: string) {
    if (window.confirm('Deseja mesmo excluir?')) {
      try {
        await deleteDoc(doc(db, 'matches', MatcheId));
        toast.success('Jogo excluído com sucesso!');

        const matchesAtualizadas = matchet.filter((matchet) => matchet.id !== MatcheId);
        setMatches(matchesAtualizadas);
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
              <Link href={{ pathname: '/formGame', query: { mdl: data.id } }}>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>

          {matches.map((matche) => (
            <>
              <React.Fragment key={matche.id}>
                <div className={styles.newTeam}>
                  <div className={styles.NameGroup}>
                    <div className={styles.Game}>
                      <div className={styles.TeamLogo}>
                        <Image
                          src={matche.team_1.team_data?.logo || "/assets/team1.png"}
                          alt=""
                          width={60}
                          height={60}
                        />
                      </div>
                      <h1>X</h1>
                      <div className={styles.TeamLogo}>
                        <Image
                          src={matche.team_2.team_data?.logo || "/assets/team1.png"}
                          alt=""
                          width={60}
                          height={60}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.crudGroup}>
                    <img
                      id={`moreInfoButton_${matche.id}`}
                      className={styles.crudIcon}
                      src="./assets/detalhes.png"
                      alt=""
                      onClick={() => toggleMoreInfo(matche.id)}
                    />
                    <Link href={{ pathname: `/editGame`, query: { id: matche.id } }}>
                      <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
                    </Link>
                    <img
                      className={styles.crudIcon}
                      src="./assets/excluir.png"
                      alt=""
                      onClick={() => popup(matche.id)}
                    />
                  </div>
                </div>

                <div
                  id={`moreInfo_${matche.id}`}
                  className={`${styles.moreInfo} ${moreInfoVisible[matche.id] ? '' : styles.hidden}`}>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Horario</p>
                    <p className={styles.dataInfo}>{matche.time}</p>
                  </div>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Local</p>
                    <p className={styles.dataInfo}>{matche.venue}</p>
                  </div>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Data</p>
                    <p className={styles.dataInfo}>{matche.date}</p>
                  </div>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Time 1</p>
                    <p className={styles.dataInfo}>{matche.team_1.team_data?.name}</p>
                  </div>

                  <div className={styles.line}>
                    <p className={styles.dataInfo}>Time 2</p>
                    <p className={styles.dataInfo}>{matche.team_2.team_data?.name}</p>
                  </div>
                </div>
              </React.Fragment>
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
      data: { id: mdl },
      matches: matches
    },
  };
}

