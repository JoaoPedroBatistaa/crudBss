import styles from './styles.module.css';
import { useRouter } from 'next/router';

import Link from 'next/link';


export default function newPlayer() {

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <div className={styles.Container}>

        <div className={styles.Card}>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Jogos</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGO</p>
              <Link href='/formGame'>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </Link>
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
                <h1>X</h1>
                <img className={styles.modalityIcon} src="./assets/team2.png" alt="" />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
                <h1>X</h1>
                <img className={styles.modalityIcon} src="./assets/team2.png" alt="" />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
                <h1>X</h1>
                <img className={styles.modalityIcon} src="./assets/team2.png" alt="" />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
                <h1>X</h1>
                <img className={styles.modalityIcon} src="./assets/team2.png" alt="" />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <div className={styles.Game}>
                <img className={styles.modalityIcon} src="./assets/team1.png" alt="" />
                <h1>X</h1>
                <img className={styles.modalityIcon} src="./assets/team2.png" alt="" />
              </div>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>




        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}