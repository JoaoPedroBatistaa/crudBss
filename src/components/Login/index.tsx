import styles from './styles.module.css';
import Header from '../Header';
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {


  return (
    <>
      <Header></Header>

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

          <Link href='/Sports'>
            <button className={styles.login}>Login</button>
          </Link>

        </div>
      </div>
    </>
  )
}
