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
            <h1 className={styles.title}>Notícias</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVA NOTÍCIA</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Manchete</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Foto</p>
            <input className={styles.fieldFile} type="file" accept="image/*" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Descrição</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Data</p>
            <input className={styles.field} type="date" />
          </div>


        </div>

        <button className={styles.save}>SALVAR</button>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}