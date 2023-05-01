import styles from './styles.module.css';
import { useRouter } from 'next/router';

function HandleBackButtonClick() {
  const router = useRouter();
  router.back();
}

export default function newPlayer() {



  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Times</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO TIME</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Time</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Logo</p>
            <input className={styles.field} type="text" placeholder='Fazer upload' />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Elenco</p>
            <input className={styles.field} type="text" placeholder='Adicionar jogador' />
          </div>


        </div>

        <button className={styles.save}>SALVAR</button>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}