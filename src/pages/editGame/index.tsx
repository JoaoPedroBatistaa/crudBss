import { db, storage } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import HomeButton from "../../components/HomeButton";

interface PlayerDetail {
  id: string;
  name: string;
  photo: string; // Ou 'logo', dependendo da propriedade real no seu objeto Item
}

interface Matche {
  championship: string; // Mantém como string, ajuste conforme necessário
  date: Date;
  modality: string; // Mantém como string, ajuste conforme necessário
  team_1: {
    score: number;
    team_id: string; // Considere mudar para um objeto ou ID se necessário
  };
  team_2: {
    score: number;
    team_id: string; // Considere mudar para um objeto ou ID se necessário
  };
  venue: string;
  fase: string;
  time: string;
  topScorer: PlayerDetail | null;
  mvp: PlayerDetail | null;
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
    team1Name: "",
    team1Logo: null as File | string | null,
    team1Score: 0,
    team2Name: "",
    team2Logo: null as File | string | null,
    team2Score: 0,
    date: "",
    location: "",
    fase: "",
    fileURL: "",
    topScorer: "",
    mvp: "",
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMatchData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    // @ts-ignore
    setMatchData((prevState) => ({
      ...prevState,
      fileURL: file || prevState.fileURL,
    }));
  };

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) {
        console.log("Match ID is not defined.");
        return;
      }

      try {
        const matchDoc = await getDoc(doc(db, "matches", id as string));
        if (matchDoc.exists()) {
          const match = matchDoc.data();
          if (match) {
            const team1Ref = match.team_1.team_id;
            const team2Ref = match.team_2.team_id;

            const team1Doc = await getDoc(team1Ref);
            const team2Doc = await getDoc(team2Ref);

            // @ts-ignore
            const team1Name = team1Doc.exists() ? team1Doc.data().name : "";
            // @ts-ignore
            const team2Name = team2Doc.exists() ? team2Doc.data().name : "";

            setMatchData({
              team1Name: team1Name,
              team1Logo: match.team_1 ? match.team_1.logo : null,
              team1Score: match.team_1 ? match.team_1.score : 0,
              team2Name: team2Name,
              team2Logo: match.team_2 ? match.team_2.logo : null,
              team2Score: match.team_2 ? match.team_2.score : 0,
              date: match.date || "",
              location: match.venue || "",
              fase: match.fase || "",
              fileURL: match.fileURL || "",
              topScorer: match.topScorer || "",
              mvp: match.mvp || "",
            });
          }
        } else {
          console.log("Não existe partida com este ID.");
        }
      } catch (error) {
        console.error("Error fetching match details: ", error);
      }
    };

    if (router.isReady) {
      fetchMatch();
    }
  }, [router.isReady, id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      console.error("Error: Match ID is not defined");
      toast.error("Error when updating match.");
      return;
    }

    try {
      let fileURL = matchData.fileURL;

      // @ts-ignore
      if (matchData.fileURL instanceof File) {
        const storageRef = ref(
          storage,
          `matches/${id}/${matchData.fileURL.name}`
        );
        await uploadBytes(storageRef, matchData.fileURL);
        fileURL = await getDownloadURL(storageRef);
      }

      const matchDataToSave = {
        ...matchData,
        team_1: {
          score: matchData.team1Score.toString(),
        },
        team_2: {
          score: matchData.team2Score.toString(),
        },
        fileURL,
      };

      // @ts-ignore
      delete matchDataToSave.team1Name;
      // @ts-ignore
      delete matchDataToSave.team1Logo;
      // @ts-ignore
      delete matchDataToSave.team1Score;
      // @ts-ignore
      delete matchDataToSave.team2Name;
      // @ts-ignore
      // @ts-ignore
      delete matchDataToSave.team2Logo;
      // @ts-ignore
      delete matchDataToSave.team2Score;

      // Atualiza o documento no Firestore
      await setDoc(doc(db, "matches", id as string), matchDataToSave, {
        merge: true,
      });

      toast.success("Match updated successfully!");
    } catch (error) {
      console.error("Error when updating match: ", error);
      toast.error("Error when updating match.");
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
            <h1 className={styles.title}>Editar Partida</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <p className={styles.label}>
                Nome do Time 1: {matchData.team1Name}
              </p>
              <input
                className={styles.field}
                type="text"
                name="team1Name"
                value={matchData.team1Name}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>
                Nome do Time 2: {matchData.team2Name}
              </p>
              <input
                className={styles.field}
                type="text"
                name="team2Name"
                value={matchData.team2Name}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Cestinha</p>
              <input
                className={styles.field}
                type="text"
                name="topScorer"
                value={matchData.topScorer}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Destaque da partida</p>
              <input
                className={styles.field}
                type="text"
                name="mvp"
                value={matchData.mvp}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação do Time 1</p>
              <input
                className={styles.field}
                type="number"
                name="team1Score"
                value={matchData.team1Score}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação do Time 2</p>
              <input
                className={styles.field}
                type="number"
                name="team2Score"
                value={matchData.team2Score}
                onChange={handleInputChange}
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

            <div className={styles.form}>
              <p className={styles.label}>Fase do Jogo</p>
              <input
                className={styles.field}
                type="text"
                name="fase"
                value={matchData.fase}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Novo PDF do Jogo</p>
              <input
                className={styles.fieldFile}
                type="file"
                name="fileURL"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>

            {matchData.fileURL && (
              <div className={styles.form}>
                <p className={styles.label}>PDF Atual</p>
                <a
                  href={matchData.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.label}
                >
                  {matchData.fileURL.length > 50
                    ? `${matchData.fileURL.substring(0, 50)}...`
                    : matchData.fileURL}
                </a>
              </div>
            )}

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
