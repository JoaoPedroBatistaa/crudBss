import styles from './styles.module.css';
import { useRouter } from 'next/router';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

interface Matche {
  championship: string;
  date: Date;
  modality: string;
  team_1: {
    score: number;
    team_id: string;
  };
  team_2: {
    score: number;
    team_id: string;
  };
  venue: string;
  time: string;
}

interface Item {
  id: string;
  name: string;
  logo: string;
}

export default function EditMatch() {
  const router = useRouter();
  const { id } = router.query;

  const [matchData, setMatchData] = useState({
    team1Name: '',
    team1Logo: null,
    team2Name: '',
    team2Logo: null,
    date: '',
    location: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMatchData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    setMatchData((prevState) => ({ ...prevState, [name]: file }));
  };

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) {
        console.log('Match ID is not defined.');
        return;
      }

      try {
        const matchDoc = await getDoc(doc(db, 'matches', id as string));
        if (matchDoc.exists()) {
          const match = matchDoc.data();
          setMatchData(match);
        } else {
          console.log('No match exists with this ID.');
        }
      } catch (error) {
        console.error('Error fetching match details: ', error);
      }
    };

    if (router.isReady) {
      fetchMatch();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error('Error: Match ID is not defined');
      toast.error('Error when updating match.');
      return;
    }

    try {
      if (matchData.team1Logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `matches/${matchData.team1Logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, matchData.team1Logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        matchData.team1Logo = downloadURL as string;
      }

      if (matchData.team2Logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `matches/${matchData.team2Logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, matchData.team2Logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        matchData.team2Logo = downloadURL as string;
      }

      await setDoc(doc(db, 'matches', id as string), matchData);

      toast.success('Match updated successfully!');
    } catch (error) {
      console.error('Error when updating match: ', error);
      toast.error('Error when updating match.');
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Editar Partida</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Time 1</p>
              <input
                className={styles.field}
                type="text"
                name="team1Name"
                value={matchData.team1Name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo time 1</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                name="team1Logo"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Nome do Time 2</p>
              <input
                className={styles.field}
                type="text"
                name="team2Name"
                value={matchData.team2Name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo time 2</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                name="team2Logo"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data do Jogo</p>
              <input
                className={styles.field}
                type="date"
                name="date"
                value={matchData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Local do Jogo</p>
              <input
                className={styles.field}
                type="text"
                name="location"
                value={matchData.location}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>
        </div>

        <button className={styles.back} onClick={HandleBackButtonClick}>
          Voltar
        </button>
      </div>
    </>
  );
}
