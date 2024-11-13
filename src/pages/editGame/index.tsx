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
    time: "",
    venue: "",
    fase: "",
    fileURL: "",
    topScorer: "",
    mvp: "",
    isVolleyball: false,
    setScores: { set1: "", set2: "", set3: "" },
    isUndefinedMatch: "não", // Indefinido por padrão
    nextTeam1: "",
    nextTeam2: "",
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
              time: match.time || "",
              venue: match.venue || "",
              fase: match.fase || "",
              fileURL: match.fileURL || "",
              topScorer: match.topScorer || "",
              mvp: match.mvp || "",
              isVolleyball: match.isVolleyball || false,
              setScores: match.setScores || { set1: "", set2: "", set3: "" },
              isUndefinedMatch:
                match.next_team_1 && match.next_team_2 ? "sim" : "não",
              nextTeam1: match.next_team_1 || "",
              nextTeam2: match.next_team_2 || "",
            });
            if (match.team_1) {
              setSelectedTeamOne({
                id: match.team_1.team_id.id,
                name: match.team_1.team_data.name,
                logo: match.team_1.team_data.logo,
              });
            }
            if (match.team_2) {
              setSelectedTeamTwo({
                id: match.team_2.team_id.id,
                name: match.team_2.team_data.name,
                logo: match.team_2.team_data.logo,
              });
            }
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
        championship: doc(db, "championships", selectedChampionship?.id || ""),
        fileURL,
      };

      if (matchData.isUndefinedMatch === "sim") {
        // @ts-ignore
        matchDataToSave["next_team_1"] = matchData.nextTeam1;
        // @ts-ignore
        matchDataToSave["next_team_2"] = matchData.nextTeam2;
        // @ts-ignore
        delete matchDataToSave["team_1"];
        // @ts-ignore
        delete matchDataToSave["team_2"];
      } else {
        // @ts-ignore
        matchDataToSave["team_1"] = {
          score: matchData.team1Score.toString(),
          team_id: doc(db, "teams", selectedTeamOne?.id || ""),
        };
        // @ts-ignore
        matchDataToSave["team_2"] = {
          score: matchData.team2Score.toString(),
          team_id: doc(db, "teams", selectedTeamTwo?.id || ""),
        };
        // @ts-ignore
        delete matchDataToSave["next_team_1"];
        // @ts-ignore
        delete matchDataToSave["next_team_2"];
      }

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
              <p className={styles.label}>Partida Indefinida?</p>
              <select
                className={styles.field}
                value={matchData.isUndefinedMatch}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    isUndefinedMatch: e.target.value,
                  }))
                }
              >
                <option value="não">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            {matchData.isUndefinedMatch === "sim" ? (
              <>
                <div className={styles.form}>
                  <p className={styles.label}>Próximo Time 1</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={matchData.nextTeam1}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        nextTeam1: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.form}>
                  <p className={styles.label}>Próximo Time 2</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={matchData.nextTeam2}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        nextTeam2: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.form}>
                  <p className={styles.label}>Time 1:</p>
                  <SearchSelectTeam onSelectItem={handleSelectTeamOne} />
                </div>
                <div className={styles.form}>
                  <p className={styles.label}>Time 2:</p>
                  <SearchSelectTeam onSelectItem={handleSelectTeamTwo} />
                </div>
              </>
            )}

            <div className={styles.form}>
              <p className={styles.label}>Horário do Jogo</p>
              <input
                className={styles.field}
                type="time"
                value={matchData.time}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Pontuação do Time 1</p>
              <input
                className={styles.field}
                type="number"
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
              <p className={styles.label}>Cestinha</p>
              <input
                className={styles.field}
                type="text"
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
                value={matchData.mvp}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, mvp: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Data do Jogo</p>
              <input
                className={styles.field}
                type="date"
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
                value={matchData.venue}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, venue: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Fase do Jogo</p>
              <input
                className={styles.field}
                type="text"
                value={matchData.fase}
                onChange={(e) =>
                  setMatchData((prev) => ({ ...prev, fase: e.target.value }))
                }
              />
            </div>

            <div className={styles.form}>
              <p className={styles.label}>Sets de Vôlei?</p>
              <select
                className={styles.field}
                value={matchData.isVolleyball ? "sim" : "não"}
                onChange={(e) =>
                  setMatchData((prev) => ({
                    ...prev,
                    isVolleyball: e.target.value === "sim",
                  }))
                }
              >
                <option value="não">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            {matchData.isVolleyball && (
              <>
                <div className={styles.form}>
                  <p className={styles.label}>Placar Set 1</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={matchData.setScores.set1}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        setScores: { ...prev.setScores, set1: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className={styles.form}>
                  <p className={styles.label}>Placar Set 2</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={matchData.setScores.set2}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        setScores: { ...prev.setScores, set2: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className={styles.form}>
                  <p className={styles.label}>Placar Set 3</p>
                  <input
                    className={styles.field}
                    type="text"
                    value={matchData.setScores.set3}
                    onChange={(e) =>
                      setMatchData((prev) => ({
                        ...prev,
                        setScores: { ...prev.setScores, set3: e.target.value },
                      }))
                    }
                  />
                </div>
              </>
            )}

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
