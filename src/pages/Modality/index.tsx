import styles from './styles.module.css';
import { useRouter } from 'next/router';

function HandleBackButtonClick() {
  const router = useRouter();
  router.back();
}

export default function Modality() {

  

  return(
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>
          
          <h1 className={styles.title}>Modalidades</h1>

          <div className={styles.modality}>
            <img className={styles.modalityIcon} src="./assets/masc.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 5x5 Masculino</h1>
          </div>
          
          <div className={styles.modality}>
            <img className={styles.sportIcon} src="./assets/masc.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 3x3 Masculino</h1>
          </div>

          <div className={styles.modality}>
            <img className={styles.modalityIcon} src="./assets/fem.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 5x5 Feminino</h1>
          </div>
          
          <div className={styles.modality}>
            <img className={styles.modalityIcon} src="./assets/fem.png" alt="" />

            <h1 className={styles.modalityName}>Basquete 3x3 Feminino</h1>
          </div>

        </div>

        <button className={styles.back}  onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}