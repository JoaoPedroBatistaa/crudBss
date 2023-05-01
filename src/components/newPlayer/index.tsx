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
            <h1 className={styles.title}>Jogadores</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGADOR</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/player.png" alt="" />
              <h1 className={styles.newTeamName}>Herbert Carnauba</h1>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>


          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/player.png" alt="" />
              <h1 className={styles.newTeamName}>Herbert Carnauba</h1>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>


          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/player.png" alt="" />
              <h1 className={styles.newTeamName}>Herbert Carnauba</h1>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>


          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/player.png" alt="" />
              <h1 className={styles.newTeamName}>Herbert Carnauba</h1>
            </div>

            <div className={styles.crudGroup}>
              <img className={styles.crudIcon} src="./assets/detalhes.png" alt="" />
              <img className={styles.crudIcon} src="./assets/editar.png" alt="" />
              <img className={styles.crudIcon} src="./assets/excluir.png" alt="" />
            </div>
          </div>


          <div className={styles.newTeam}>
            <div className={styles.NameGroup}>
              <img className={styles.modalityIcon} src="./assets/player.png" alt="" />
              <h1 className={styles.newTeamName}>Herbert Carnauba</h1>
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