import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GetServerSidePropsContext } from 'next';



interface Modality{
  id:string
}

export default function Categories({ data }: { data: Modality }) {

  
  console.log(data);


  function HandleBackButtonClick() {
    window.history.back();
  }
  console.log(data.id)

  useEffect(()=>{
    
  },[])
  

  return (
    <>
      <Header></Header>

      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Categorias</h1>

          <Link href={{ pathname: '/newTeam', query: { mdl: data.id} }}>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/times.png" alt="" />

              <h1 className={styles.categorieName}>Times</h1>
            </div>
          </Link>

         <Link href={{ pathname: '/newPlayer', query: { mdl: data.id} }}>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/masc.png" alt="" />

              <h1 className={styles.categorieName}>Jogadores</h1>
            </div>
          </Link>
          <Link href={{ pathname: '/newChampionship', query: { mdl: data.id} }}>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/campeonatos.png" alt="" />

              <h1 className={styles.categorieName}>Campeonatos</h1>
            </div>
          </Link>

          <Link href={{ pathname: '/newNews', query: { mdl: data.id} }}>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/noticias.png" alt="" />

              <h1 className={styles.categorieName}>Notícias</h1>
            </div>
          </Link>
           <Link href={{ pathname: '/NewGame', query: { mdl: data.id} }}>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/jogos.png" alt="" />

              <h1 className={styles.categorieName}>Jogos</h1>
            </div>
          </Link>

        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}

export async function getServerSideProps(context:GetServerSidePropsContext) {
  const { query } = context;
  const {mdl} = query;
  console.log(mdl)

  return {
    props: {
      data:{id:mdl}
    },
  };
}
