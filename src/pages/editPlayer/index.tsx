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
            <h1 className={styles.title}>Jogadores</h1>

            <div className={styles.new}>
              <p className={styles.newTitle}>NOVO JOGADOR</p>
              <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
            </div>
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Nome do Jogador</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Foto do Jogador</p>
            <input className={styles.fieldFile} type="file" accept="image/*" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Data de Nascimento</p>
            <input 
              className={styles.field} 
              type="date"
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>CPF</p>
            <input 
              className={styles.field} 
              type="text"
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
            />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Posição</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Pontuação total</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Bolas de três</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVP's partida</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>MVP's campeonato</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas partida</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Cestinhas campeonato</p>
            <input className={styles.field} type="text" />
          </div>

          <div className={styles.form}>
            <p className={styles.label}>Instagram</p>
            <input className={styles.field} type="text" />
          </div>


        </div>

        <button className={styles.save}>SALVAR</button>

        <button className={styles.back} onClick={HandleBackButtonClick}>Voltar</button>

      </div>
    </>
  )
}