import styles from './styles.module.css';
import Header from '../Header';
import Head from 'next/head';
import Link from 'next/link';
import  {firebase, auth,signInWithEmailAndPassword} from '../../firebase'
import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth,email, password)
      .then((userCredential) => {
        // User signed in successfully
        const user = userCredential.user;
        toast.success('Login realizado com sucesso!');
        console.log('User signed in:', user);
        router.push('/Sports');
      })
      .catch((error) => {
        // Handle authentication errors
        console.error('Authentication error:', error);
      });
  };


  return (
    <>
      <Header></Header>
      <form onSubmit={handleLogin}>
        <div className={styles.Container}>
          <div className={styles.Card}>

            <h1 className={styles.title}>Login</h1>

            <div className={styles.form}>
              <p className={styles.label}>Email</p>
              <input className={styles.field} type="email"  value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Senha</p>
              <input className={styles.field} type="password" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className={styles.login} type="submit">Login</button>

          </div>
        </div>
      </form>
    </>
  )
}
