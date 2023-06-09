import { GetServerSidePropsContext } from 'next';
import styles from './styles.module.css';
import { useState } from 'react';
import SearchSelectTeam from '@/components/SearchSelectTeam';
import SearchSelectChampionship from '@/components/SearchSelectChampionship';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useRouter } from 'next/router';
import Spinner from '@/components/Spinner';
import { toast } from 'react-toastify';

interface Modality {
  id: string;
}

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

export default function FormNewMatche({ data }: { data: Modality }) {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);
  const [selectedTeamTwo, setSelectedTeamTwo] = useState<Item | null>(null);
  const [selectedChampionship, setSelectedChampionship] = useState<Item | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>(''); // Novo estado para armazenar o nome do arquivo
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const matcheRef = collection(db, 'matches');

      const modalityRef = doc(db, 'modalities', data.id);
      const teamOneRef = doc(db, 'teams', selectedTeamOne?.id || '');
      const teamTwoRef = doc(db, 'teams', selectedTeamTwo?.id || '');
      const championshipRef = doc(db, 'championships', selectedChampionship?.id || '');

      const newMatche = {
        championship: championshipRef,
        date: selectedDate,
        modality: modalityRef,
        team_1: {
          score: 0,
          team_id: teamOneRef,
        },
        team_2: {
          score: 0,
          team_id: teamTwoRef,
        },
        venue: selectedVenue,
        time: selectedTime,
      };

      const docRef = await addDoc(matcheRef, {
        ...newMatche,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (selectedFile) {
        const storageRef = ref(storage, `matches/${docRef.id}/${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(docRef, { fileURL: downloadURL }, { merge: true });
      }

      setIsLoading(false);
      setSelectedTime('');
      setSelectedDate('');
      setSelectedVenue('');
      setSelectedTeamOne(null);
      setSelectedTeamTwo(null);
      setSelectedChampionship(null);
      setSelectedFile(null);
      setSelectedFileName(''); // Limpar o nome do arquivo selecionado
      toast.success("Jogo cadastrado com sucesso!");
      router.push("newGame?mdl=" + data.id);
      console.log('Novo jogo salvo com sucesso no Firestore!');
    } catch (error) {
      setIsLoading(false);
      toast.error("Erro ao cadastrar jogo!");
      console.error('Erro ao salvar o novo jogo:', error);
    }
  }

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };
  const handleSelectTeamTwo = (item: Item) => {
    setSelectedTeamTwo(item);
  };
  const handleSelectChampionship = (item: Item) => {
    setSelectedChampionship(item);
  };

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setSelectedFileName(file?.name || ''); // Atualizar o nome do arquivo selecionado
  }

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    isLoading ? <Spinner /> :
      <>
        <div className={styles.Container}>
          <div className={styles.Card}>
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>Jogos</h1>
              <div className={styles.new}>
                <p className={styles.newTitle}>NOVO JOGO</p>
                <img className={styles.crudIcon} src="./assets/novo.png" alt="" />
              </div>
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Campeonato:</p>
              <SearchSelectChampionship onSelectItem={handleSelectChampionship} />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Time 1:</p>
              <SearchSelectTeam onSelectItem={handleSelectTeamOne} />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Time 2:</p>
              <SearchSelectTeam onSelectItem={handleSelectTeamTwo} />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Data do Jogo</p>
              <input
                className={styles.field}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Horário do Jogo</p>
              <input
                className={styles.field}
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>Local do Jogo</p>
              <input
                className={styles.field}
                type="text"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
              />
            </div>
            <div className={styles.form}>
              <p className={styles.label}>PDF do Jogo</p>
              <input
              className={styles.fieldFile}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <button className={styles.save} onClick={handleSubmit} disabled={isLoading}>
            SALVAR
          </button>
          <button className={styles.back} onClick={HandleBackButtonClick}>
            Voltar
          </button>
        </div>
      </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context;
  const { mdl } = query;
  console.log(mdl);

  return {
    props: {
      data: { id: mdl },
    },
  };
}
