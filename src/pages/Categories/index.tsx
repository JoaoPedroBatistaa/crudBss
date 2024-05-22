import Header from "../../components/Header";
import styles from "./styles.module.css";

import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useEffect } from "react";

import HomeButton from "../../components/HomeButton";

interface Modality {
  id: string;
}

export default function Categories({ data }: { data: Modality }) {
  console.log(data);

  function HandleBackButtonClick() {
    window.history.back();
  }
  console.log(data.id);

  useEffect(() => {}, []);

  return (
    <>
      <Header></Header>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <h1 className={styles.title}>Categorias</h1>

          <Link href={{ pathname: "/newTeam", query: { mdl: data.id } }}>
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/times.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Times</h1>
            </div>
          </Link>

          <Link href={{ pathname: "/newPlayer", query: { mdl: data.id } }}>
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/jogador-de-basquete.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Jogadores</h1>
            </div>
          </Link>
          <Link
            href={{ pathname: "/newChampionship", query: { mdl: data.id } }}
          >
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/campeonato.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Campeonatos</h1>
            </div>
          </Link>

          <Link href={{ pathname: "/newGame", query: { mdl: data.id } }}>
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/versus.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Jogos</h1>
            </div>
          </Link>
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
  console.log(mdl);

  return {
    props: {
      data: { id: mdl },
    },
  };
}
