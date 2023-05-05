import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import { getDocs,collection, query, where, doc, getDoc } from "firebase/firestore";
import {db} from '../../firebase'
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { GetServerSidePropsContext } from 'next';

async function getCollectionData(sport:string) {


  const collectionRef = collection(db, 'modalities');
  const sportRef = await getSportReference(sport)

  if (!sportRef) {
     toast.success('Esporte não encontrado!');
    return;
  }

  console.log("sportRef-- buscar modalidades")

  const q = query(collection(db, "modalities"), where('sport', '==', sportRef));
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

  return documents;
}

async function getSportReference(sportId:string) {

  // buscar esportes
  console.log("buscar esportes -"+sportId)
  const sportsCollection = 'sports';
  const sportRef = doc(db, sportsCollection,sportId);
  const sportDoc = await getDoc(sportRef);

  if (sportDoc.exists()) {
      console.log("Sucesso ao buscar esportes -"+sportId)

    return sportRef;
  } else {
    toast.error('Esporte não encontrado!');
    return null;
  }
}


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { sport } = query;

  let sportString: string = '';
  if (typeof sport === 'string') {
    sportString = sport;
  } else if (Array.isArray(sport)) {
    sportString = sport.join(',');
  }

  // Use o parâmetro de query para buscar os dados
  const data = await getCollectionData(sportString);

  return {
    props: {
      data,
    },
  };
}


interface Modality{
  id:string,
  name:string,
  gender:string,

}


export default function Modality({ data }: { data: [Modality] }) {

   const router = useRouter();
  const { query } = router;

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
    
      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Modalidades</h1>

           {data.map(item => (
            <Link href={{ pathname: '/Categories', query: { mdl: item.id} }} key={item.id}>
                <div className={styles.modality}>
                  <img className={styles.modalityIcon} src={item.gender == "Masculino" ? "./assets/masc.png":"./assets/fem.png"} alt="" />

                  <h1 className={styles.modalityName}>{item.name}</h1>
                </div>
              </Link>
            
            ))}
{/* 
          <Link href='/Categories'>
            <div className={styles.modality}>
              <img className={styles.modalityIcon} src="./assets/masc.png" alt="" />

              <h1 className={styles.modalityName}>Basquete 5x5 Masculino</h1>
            </div>
          </Link>


          <Link href='/Categories'>
          <div className={styles.modality}>
            <img className={styles.sportIcon} src="./assets/masc.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 3x3 Masculino</h1>
          </div>
          </Link>


          <Link href='/Categories'>
            <div className={styles.modality}>
              <img className={styles.modalityIcon} src="./assets/fem.png" alt="" />

              <h1 className={styles.modalityName}>Basquete 5x5 Feminino</h1>
            </div>
          </Link>

          <Link href='/Categories'>
          <div className={styles.modality}>
            <img className={styles.modalityIcon} src="./assets/fem.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 3x3 Feminino</h1>
          </div>
          </Link> */}

        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}


