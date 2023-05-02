import styles from './styles.module.css';
import { useRouter } from 'next/router';


export default function newPlayer() {

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Campeonatos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO CAMPEONTATO</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Campeonato</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Logo do campeonato</p>
            <input className={styles.field} type="file" accept="image/*" />
          </div>



        </div>

        <button className={styles.save}>SALVAR</button>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}