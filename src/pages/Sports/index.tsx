import styles from './styles.module.css';
import Header from '../../components/Header';

import Link from 'next/link';

function Sports() {
  return (
    <>
      <Header></Header>

      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Esportes</h1>

          <Link href='/Categories'>
            <div className={styles.sport}>
              <img className={styles.sportIcon} src="./assets/basquete.png" alt="" />

              <h1 className={styles.sportName}>Basquete</h1>
            </div>
          </Link>

          <div className={styles.sport}>
            <img className={styles.sportIcon} src="./assets/handebol.png" alt="" />

            <h1 className={styles.sportName}>Handebol</h1>
          </div>

          <div className={styles.sport}>
            <img className={styles.sportIcon} src="./assets/volei.png" alt="" />

            <h1 className={styles.sportName}>Voleibol</h1>
          </div>

        </div>
      </div>
    </>
  )
}

export default Sports;