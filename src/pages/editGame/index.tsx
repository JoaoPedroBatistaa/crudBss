import { db, storage } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

import SearchSelectChampionship from "@/components/SearchSelectChampionship";
import SearchSelectTeam from "@/components/SearchSelectTeam";
import HomeButton from "../../components/HomeButton";

interface PlayerDetail {
  id: string;
  name: string;
  photo: string;
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
    team1Score: 0,
    team2Score: 0,
    date: "",
    venue: "",
    fase: "",
    fileURL: "",
    topScorer: "",
    mvp: "",
  });

  const [selectedTeamOne, setSelectedTeamOne] = useState<Item | null>(null);
  const [selectedTeamTwo, setSelectedTeamTwo] = useState<Item | null>(null);
  const [selectedChampionship, setSelectedChampionship] = useState<Item | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) return;

      try {
        const matchDoc = await getDoc(doc(db, "matches", id as string));
        if (matchDoc.exists()) {
          const match = matchDoc.data();
          if (match) {
            setMatchData({
              team1Score: match.team_1?.score || "",
              team2Score: match.team_2?.score || "",
              date: match.date || "",
              venue: match.venue || "",
              fase: match.fase || "",
              fileURL: match.fileURL || "",
              topScorer: match.topScorer || "",
              mvp: match.mvp || "",
            });
            setSelectedTeamOne({
              id: match.team_1.team_id.id,
              name: match.team_1.team_id.name,
              logo: match.team_1.team_id.logo,
            });
            setSelectedTeamTwo({
              id: match.team_2.team_id.id,
              name: match.team_2.team_id.name,
              logo: match.team_2.team_id.logo,
            });
            setSelectedChampionship({
              id: match.championship.id,
              name: match.championship.name,
              logo: match.championship.logo,
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
      toast.error("Erro ao atualizar a partida.");
      return;
    }

    try {
      let fileURL = matchData.fileURL;

      if (selectedFile) {
        const storageRef = ref(storage, `matches/${id}/${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        fileURL = await getDownloadURL(storageRef);
      }

      const matchDataToSave = {
        ...matchData,
        team_1: {
          score: matchData.team1Score.toString(),
          team_id: doc(db, "teams", selectedTeamOne?.id || ""),
        },
        team_2: {
          score: matchData.team2Score.toString(),
          team_id: doc(db, "teams", selectedTeamTwo?.id || ""),
        },
        championship: doc(db, "championships", selectedChampionship?.id || ""),
        fileURL,
      };

      await setDoc(doc(db, "matches", id as string), matchDataToSave, {
        merge: true,
      });
      toast.success("Partida atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar a partida:", error);
      toast.error("Erro ao atualizar a partida.");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file || null);
  };

  const handleSelectTeamOne = (item: Item) => {
    setSelectedTeamOne(item);
  };

  const handleSelectTeamTwo = (item: Item) => {
    setSelectedTeamTwo(item);
  };

  const handleSelectChampionship = (item: Item) => {
    setSelectedChampionship(item);
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
              <p className={styles.label}>Campeonato:</p>
              <SearchSelectChampionship
                onSelectItem={handleSelectChampionship}
              />
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
              <p className={styles.label}>Cestinha</p>
              <input
                className={styles.field}
                type="text"
                name="topScorer"
                value={matchData.topScorer}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    topScorer: e.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Destaque da partida</p>
              <input
                className={styles.field}
                type="text"
                name="mvp"
                value={matchData.mvp}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, mvp: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação do Time 1</p>
              <input
                className={styles.field}
                type="number"
                name="team1Score"
                value={matchData.team1Score}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    team1Score: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação do Time 2</p>
              <input
                className={styles.field}
                type="number"
                name="team2Score"
                value={matchData.team2Score}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    team2Score: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data do Jogo</p>
              <input
                className={styles.field}
                type="date"
                name="date"
                value={matchData.date}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Local do Jogo</p>
              <input
                className={styles.field}
                type="text"
                name="venue"
                value={matchData.venue || ""}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    venue: e.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Fase do Jogo</p>
              <input
                className={styles.field}
                type="text"
                name="fase"
                value={matchData.fase}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, fase: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Novo PDF do Jogo</p>
              <input
                className={styles.fieldFile}
                type="file"
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
