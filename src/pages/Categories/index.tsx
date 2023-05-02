import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import Link from 'next/link';


function HandleBackButtonClick() {
  const router = useRouter();
  router.back();
}

export default function Categories() {



  return (
    <>
      <Header></Header>

      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Categorias</h1>

          <Link href='/newTeam'>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/times.png" alt="" />

              <h1 className={styles.categorieName}>Times</h1>
            </div>
          </Link>

          <Link href='/newPlayer'>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/masc.png" alt="" />

              <h1 className={styles.categorieName}>Jogadores</h1>
            </div>
          </Link>

          <Link href='/newChampionship'>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/campeonatos.png" alt="" />

              <h1 className={styles.categorieName}>Campeonatos</h1>
            </div>
          </Link>

          <Link href='newNews'>
            <div className={styles.categorie}>
              <img className={styles.categorieIcon} src="./assets/noticias.png" alt="" />

              <h1 className={styles.categorieName}>Notícias</h1>
            </div>
          </Link>

          <Link href='newGame'>
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