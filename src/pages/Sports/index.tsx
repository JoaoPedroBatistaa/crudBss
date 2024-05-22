import Header from "../../components/Header";
import styles from "./styles.module.css";

import { User, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { auth, signOut } from "../../firebase";

import HomeButton from "../../components/HomeButton";

function Sports() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
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
        toast.success("Logout realizado com sucesso!");
        console.log("User signed out");
        router.push("/");
      })
      .catch((error) => {
        // Handle sign-out errors
        console.error("Sign-out error:", error);
      });
  };
  return (
    <>
      <Header></Header>
      <HomeButton></HomeButton>

      <div className={styles.Container}>
        <div className={styles.Card}>
          <h1 className={styles.title}>Esportes</h1>

          <Link href={{ pathname: "/newNews" }}>
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/noticias.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Notícias</h1>
            </div>
          </Link>

          <Link href={{ pathname: "/newSponsor" }}>
            <div className={styles.categorie}>
              <img
                className={styles.categorieIcon}
                src="./assets/noticias.png"
                alt=""
              />

              <h1 className={styles.categorieName}>Patrocinadores</h1>
            </div>
          </Link>

          <Link
            href={{
              pathname: "/Modality",
              query: { sport: "acTT1Mf23Eoko1YMpDjK" },
            }}
          >
            <div className={styles.sport}>
              <img
                className={styles.sportIcon}
                src="./assets/basquete.png"
                alt=""
              />

              <h1 className={styles.sportName}>Basquete</h1>
            </div>
          </Link>

          <div className={styles.sport}>
            <img
              className={styles.sportIcon}
              src="./assets/handebol.png"
              alt=""
            />

            <h1 className={styles.sportName}>Handebol</h1>
          </div>

          <Link
            href={{
              pathname: "/Modality",
              query: { sport: "d0vLyFpWs3Mh7DPuEY2v" },
            }}
          >
            <div className={styles.sport}>
              <img
                className={styles.sportIcon}
                src="./assets/volei.png"
                alt=""
              />

              <h1 className={styles.sportName}>Voleibol</h1>
            </div>
          </Link>

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
  );
}

export default Sports;
