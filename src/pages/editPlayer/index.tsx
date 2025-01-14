import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "firebase/storage";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import SearchSelectTeam from "@/components/SearchSelectTeam";
import HomeButton from "../../components/HomeButton";

interface Player {
  instagram?: string;
  name: string;
  photo?: File | string | null;
  position: string;
  cpf: string;
  birthDate: string;
  about: string;
  destaquePartida?: string;
  pontuacaoGeral?: string;
  cestinhaPartida?: string;
  cestinhaCampeonato?: string;
  bolasTresGeral?: string;
  reiTresCampeonato?: string;
  selecaoCampeonato?: string;
  destaqueCampeonato?: string;
  curiosities?: string[];
  teams?: { name: string }[];
}

export default function EditPlayer() {
  const [playerData, setPlayerData] = useState<Player>({
    name: "",
    photo: null,
    position: "",
    instagram: "",
    birthDate: "",
    cpf: "",
    about: "",
    destaquePartida: "",
    pontuacaoGeral: "",
    cestinhaPartida: "",
    cestinhaCampeonato: "",
    bolasTresGeral: "",
    reiTresCampeonato: "",
    selecaoCampeonato: "",
    destaqueCampeonato: "",
    curiosities: [],
    teams: [],
  });
  const [newCuriosity, setNewCuriosity] = useState("");
  const router = useRouter();
  const { id } = router.query;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setPlayerData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setPlayerData((prevState) => ({ ...prevState, photo: file }));
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;

      try {
        const playerDoc = await getDoc(doc(db, "players", id as string));
        if (playerDoc.exists()) {
          const player = playerDoc.data() as Player;
          setPlayerData(player);
        } else {
          console.log("No player exists with this ID.");
        }
      } catch (error) {
        console.error("Error fetching player details: ", error);
      }
    };

    if (router.isReady) {
      fetchPlayer();
    }
  }, [router.isReady, id]);

  const addTeam = (team: { name: string }) => {
    setPlayerData((prevState) => ({
      ...prevState,
      teams: [...(prevState.teams || []), team],
    }));
  };

  const removeTeam = (index: number) => {
    setPlayerData((prevState) => ({
      ...prevState,
      teams: prevState.teams?.filter((_, i) => i !== index) || [],
    }));
  };

  const addCuriosity = () => {
    if (newCuriosity.trim()) {
      setPlayerData((prevState) => ({
        ...prevState,
        curiosities: [...(prevState.curiosities || []), newCuriosity],
      }));
      setNewCuriosity("");
    }
  };

  const removeCuriosity = (index: number) => {
    setPlayerData((prevState) => ({
      ...prevState,
      curiosities: prevState.curiosities?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error("Error: Player ID is not defined");
      toast.error("Error when updating player.");
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

      await setDoc(doc(db, "players", id as string), playerData);
      toast.success("Player updated successfully!");
    } catch (error) {
      console.error("Error when updating player: ", error);
      toast.error("Error when updating player.");
    }
  };

  function HandleBackButtonClick() {
    window.history.back();
  }

  return (
    <>
      <HomeButton />

      <div className={styles.Container}>
        <div className={styles.Card}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Editar Jogador</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>Nome do Jogador</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.name}
                name="name"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Foto do Jogador</p>
              <input
                className={styles.fieldFile}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Posição</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.position}
                name="position"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Sobre o jogador</p>
              <textarea
                className={styles.field}
                value={playerData.about}
                name="about"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data de Nascimento</p>
              <input
                className={styles.field}
                type="date"
                value={playerData.birthDate}
                name="birthDate"
                onChange={handleInputChange}
              />
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
              <input
                className={styles.field}
                type="text"
                value={playerData.instagram}
                name="instagram"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Destaque da Partida</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.destaquePartida}
                name="destaquePartida"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação Geral</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.pontuacaoGeral}
                name="pontuacaoGeral"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Cestinha da Partida</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.cestinhaPartida}
                name="cestinhaPartida"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Cestinha Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.cestinhaCampeonato}
                name="cestinhaCampeonato"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Bolas de 3 Geral</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.bolasTresGeral}
                name="bolasTresGeral"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Rei dos 3 Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.reiTresCampeonato}
                name="reiTresCampeonato"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Seleção do Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.selecaoCampeonato}
                name="selecaoCampeonato"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Destaque do Campeonato</p>
              <input
                className={styles.field}
                type="text"
                value={playerData.destaqueCampeonato}
                name="destaqueCampeonato"
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Curiosidades</p>
              {playerData.curiosities?.map((curiosity, index) => (
                <div key={index} className={styles.teamItem}>
                  <span className={styles.label}>{curiosity}</span>
                  <button
                    type="button"
                    className={styles.save}
                    onClick={() => removeCuriosity(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <input
                className={styles.field}
                type="text"
                value={newCuriosity}
                onChange={(e) => setNewCuriosity(e.target.value)}
                placeholder="Adicione uma curiosidade"
              />
              <button className={styles.save} onClick={addCuriosity}>
                Adicionar Curiosidade
              </button>
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Equipes</p>
              {playerData.teams?.map((team, index) => (
                <div key={index} className={styles.teamItem}>
                  <span className={styles.label}>{team.name}</span>
                  <button
                    type="button"
                    className={styles.save}
                    onClick={() => removeTeam(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}

              <SearchSelectTeam onSelectItem={addTeam} />
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
