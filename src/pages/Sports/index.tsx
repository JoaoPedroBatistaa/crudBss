import styles from './styles.module.css';
import Header from '../../components/Header';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import  {firebase, auth,signInWithEmailAndPassword,signOut} from '../../firebase'
import { useRouter } from 'next/router';
import {  User,onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';


function Sports() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser)
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // User signed out successfully
        toast.success('Logout realizado com sucesso!');
        console.log('User signed out');
        router.push('/');
      })
      .catch((error) => {
        // Handle sign-out errors
        console.error('Sign-out error:', error);
      });
  };
  return (
    <>
      <Header></Header>

      <div className={styles.Container}>

        <div className={styles.Card}>

          <h1 className={styles.title}>Esportes</h1>

          <Link href={{ pathname: '/Modality', query: { sport: 'acTT1Mf23Eoko1YMpDjK'} }}>
            <div className={styles.sport}>
              <img className={styles.sportIcon} src="./assets/basquete.png" alt="" />

              <h1 className={styles.sportName}>Basquete</h1>
            </div>
          </Link>

          <div className={styles.sport}>
            <img className={styles.sportIcon} src="./assets/handebol.png" alt="" />

            <h1 className={styles.sportName}>Handebol</h1>
          </div>

          <div className={styles.sport}>
            <img className={styles.sportIcon} src="./assets/volei.png" alt="" />

            <h1 className={styles.sportName}>Voleibol</h1>
          </div>

          <button 
            onClick={handleLogout} 
            className={styles.sport} 
            disabled={!user}
          >
            <h1 className={styles.sportName}>Logout</h1>
          </button>


        </div>
      </div>
    </>
  )
}

export default Sports;