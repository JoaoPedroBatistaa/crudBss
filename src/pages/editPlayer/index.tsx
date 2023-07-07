import styles from './styles.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'firebase/storage';
import InputMask from 'react-input-mask';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'react-toastify';

interface Modality {
  id: string;
}

interface Player {
  instagram?: string;
  name: string;
  photo?: File | string | null;
  position: string;
  cpf: string;
  kingplayer:Number,
  birthDate: string
}

export default function EditPlayer() {
  const [modality, setModality] = useState<string>('');
  const router = useRouter();
  const { id } = router.query;

  const [playerData, setPlayerData] = useState<Player>({
    name: '',
    photo: null,
    kingplayer: 0,
    position: '',
    instagram: '',
    birthDate: '',
    cpf: ''
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPlayerData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    setPlayerData((prevState) => ({ ...prevState, photo: file }));
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) {
        console.log('Player ID is not defined.');
        return;
      }

      try {
        const playerDoc = await getDoc(doc(db, 'players', id as string));
        if (playerDoc.exists()) {
          const player = playerDoc.data() as Player;
          setPlayerData(player);
        } else {
          console.log('No player exists with this ID.');
        }
      } catch (error) {
        console.error('Error fetching player details: ', error);
      }
    };

    if (router.isReady) {
      fetchPlayer();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error('Error: Player ID is not defined');
      toast.error('Error when updating player.');
      return;
    }

    try {
      if (playerData.photo instanceof File) {
        const storage = getStorage();
        const fileRef = ref(storage, `players/${playerData.photo.name}`);

        const uploadTask = uploadBytesResumable(fileRef, playerData.photo);
        await uploadTask;

        const downloadURL = await getDownloadURL(fileRef);
        playerData.photo = downloadURL as string;
      }

      await setDoc(doc(db, 'players', id as string), playerData);

      toast.success('Player updated successfully!');
    } catch (error) {
      console.error('Error when updating player: ', error);
      toast.error('Error when updating player.');
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
            <h1 className={styles.title}>Editar Jogador</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Jogador</p>
              <input className={styles.field} type="text" value={playerData.name} name="name" onChange={handleInputChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Foto do Jogador</p>
              <input className={styles.fieldFile} type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Posição</p>
              <input className={styles.field} type="text" value={playerData.position} name="position" onChange={handleInputChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data de Nascimento</p>
              <input className={styles.field} type="date" value={playerData.birthDate} name="birthDate" onChange={handleInputChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Rei(a) dos Três Jogadores</p>
              <input className={styles.field} type="number" value={playerData.kingplayer.toString()} name="kingplayer" onChange={handleInputChange} />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>CPF</p>
              <InputMask
                className={styles.field}
                mask="999.999.999-99"
                maskChar={null}
                name="cpf"
                value={playerData.cpf}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Instagram</p>
              <input className={styles.field} type="text" value={playerData.instagram} name="instagram" onChange={handleInputChange} />
            </div>

            <button type="submit" className={styles.save}>
              SALVAR
            </button>
          </form>

          <button className={styles.back} onClick={HandleBackButtonClick}>
            Voltar
          </button>
        </div>
      </div>
    </>
  );
}
