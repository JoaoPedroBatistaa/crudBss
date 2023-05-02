import { useState } from 'react';
import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function NewTeam() {

  const [moreInfoVisible, setMoreInfoVisible] = useState(false);
  const router = useRouter();
  function toggleMoreInfo() {
    setMoreInfoVisible(!moreInfoVisible);
  }

  function HandleBackButtonClick() {
    window.history.back();
  }

  function popup() {
    alert('Deseja mesmo excluir?')
  }


  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Times</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO TIME</p>
              <Link href='/formTeam'>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
              <h1 className={styles.newTeamName}>JAVA Basquetebol</h1>
            </div>

            <div className={styles.crudGroup}>
              <img id='moreInfoButton' className={styles.crudIcon} src="./assets/detalhes.png" alt="" onClick={toggleMoreInfo} />
              <Link href='/editTeam'>
                <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              </Link>
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" onClick={popup} />
            </div>
          </div>

          <div id='moreInfo' className={`${styles.moreInfo} ${moreInfoVisible ? '' : styles.hidden}`}>
            <div className={styles.line}>
              <p className={styles.dataInfo}>Nome do Time</p>
              <p className={styles.dataInfo}>JAVA Basquetebol</p>
            </div>
            <div className={styles.line}>
              <p className={styles.dataInfo}>Logo do time</p>
              <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
            </div>
            <div className={styles.line}>
              <p className={styles.dataInfo}>Elenco</p>
              <div className={styles.elencoList}>
                <p className={styles.dataInfo}>Fulano</p>
                <p className={styles.dataInfo}>Fulano</p>
                <p className={styles.dataInfo}>Fulano</p>
                <p className={styles.dataInfo}>Fulano</p>
                <p className={styles.dataInfo}>Fulano</p>
              </div>
            </div>
          </div>


        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}
