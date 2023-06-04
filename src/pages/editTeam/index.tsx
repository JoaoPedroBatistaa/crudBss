import styles from './styles.module.css';
import { useRouter } from 'next/router';
import 'firebase/storage';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

export default function EditTeam() {
  const router = useRouter();
  const { id } = router.query;

  const [teamData, setTeamData] = useState({
    name: '',
    logo: null,
    instagram: '',
    whatsapp: '',
    players: [],
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTeamData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    setTeamData((prevState) => ({ ...prevState, [name]: file }));
  };

  useEffect(() => {
    const fetchTeam = async () => {
      if (!id) {
        console.log('Team ID is not defined.');
        return;
      }

      try {
        const teamDoc = await getDoc(doc(db, 'teams', id as string));
        if (teamDoc.exists()) {
          const team = teamDoc.data();
          setTeamData(team);
        } else {
          console.log('No team exists with this ID.');
        }
      } catch (error) {
        console.error('Error fetching team details: ', error);
      }
    };

    if (router.isReady) {
      fetchTeam();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error('Error: Team ID is not defined');
      toast.error('Error when updating team.');
      return;
    }

    try {
      if (teamData.logo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `teams/${teamData.logo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, teamData.logo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        teamData.logo = downloadURL as string;
      }

      await setDoc(doc(db, 'teams', id as string), teamData);

      toast.success('Team updated successfully!');
      router.push({ pathname: '/newTeam', query: { mdl: id } });;
    } catch (error) {
      console.error('Error when updating team: ', error);
      toast.error('Error when updating team.');
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
            <h1 className={styles.title}>Editar Time</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Time</p>
              <input
                className={styles.field}
                type="text"
                name="name"
                value={teamData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Logo</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                name="logo"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Instagram do Time:</p>
              <input
                className={styles.field}
                type="text"
                name="instagram"
                value={teamData.instagram}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>WhatsApp Responsável:</p>
              <input
                className={styles.field}
                type="text"
                name="whatsapp"
                value={teamData.whatsapp}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Elenco</p>
              <select className={styles.select} name="players" multiple>
                {/* Renderizar opções de jogadores */}
              </select>
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
