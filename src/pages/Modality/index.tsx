import Link from 'next/link';
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import { getDocs,collection, query, where } from "firebase/firestore";
import {db} from '../../firebase'
import { useEffect, useState } from 'react';

async function getCollectionData(sport:string) {
  const collectionRef = collection(db, 'modalities');
  console.log('/sports/'+sport)
  // const q = query(collection(db, "modalities"), where("sport", "==", '/sports/'+sport));
  const q = query(collection(db, "modalities"))
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



// export async function getStaticProps(context) {
//  const { query } = context;


//   console.log(context)


//   const data = await getCollectionData();

//   return {
//     props: {
//       data,
//     },
//     revalidate: 60, // Optional: Update the data every 60 seconds
//   };
// }

export async function getServerSideProps(context) {
  const { query } = context;
  const {sport} = query;
  console.log(sport)
  // const { dynamicParam } = query;

  // Use o parâmetro de query para buscar os dados
  const data = await getCollectionData(sport);

  return {
    props: {
      data,
    },
  };
}




export default function Modality({ data }) {

   const router = useRouter();
  const { query } = router;

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
    
      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Modalidades-{query.sport}</h1>

           {data.map(item => (
          
            <Link href='/Categories' key={item.id}>
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


