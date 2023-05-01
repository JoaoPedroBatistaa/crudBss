import styles from './styles.module.css';

export default function Sports() {
  return(
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>
          
          <h1 className={styles.title}>Esportes</h1>

          <div className={styles.sport}>
            <img className={styles.sportIcon} src="./assets/basquete.png" alt="" />

            <h1 className={styles.sportName}>Basquete</h1>
          </div>
          
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