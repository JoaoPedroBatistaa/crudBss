import styles from './styles.module.css';

export default function Login() {
  return(
    <>
      <div className={styles.Container}>
        <div className={styles.Card}>
          
          <h1 className={styles.title}>Login</h1>

          <div className={styles.form}>
            <p className={styles.label}>Email</p>
            <input className={styles.field} type="email" />
          </div>
          
          <div className={styles.form}>
            <p className={styles.label}>Senha</p>
            <input className={styles.field} type="password" />
          </div>

          <button className={styles.login}>Login</button>
        </div>
      </div>
    </>
  )
}