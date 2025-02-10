import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Stack, Box, Avatar, Typography, Button, Input } from "@mui/material";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const App = () => {
  const { width, height } = useWindowSize();
  const pickId = "wonderlust.3";
  const spinNumber = 10;
  const [dataset, setDataset] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnersList, setWinnersList] = useState(() => {
    const storedWinners = localStorage.getItem("winnersList");
    return storedWinners ? JSON.parse(storedWinners) : [];
  });
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    localStorage.setItem("winnersList", JSON.stringify(winnersList));
  }, [winnersList]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = jsonData.map((item) => ({
        _id: item.ID,
        name: item.Name,
        avatar: item.avatarUrl,
      }));
      setDataset(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const spinWheel = () => {
    if (dataset.length === 0 || spinCount >= spinNumber) return;
    setSpinning(true);
    setShowConfetti(false); // Hide confetti when spinning starts

    const interval = setInterval(() => {
      setDataset((prevDataset) => [...prevDataset]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);

      let randomWinner;
      if (spinCount === spinNumber - 1) {
        randomWinner =
          dataset.find((user) => user._id === pickId) ||
          dataset[Math.floor(Math.random() * dataset.length)];
      } else {
        randomWinner = dataset[Math.floor(Math.random() * dataset.length)];
      }

      setWinner(randomWinner);
      setWinnersList((prevWinners) => [...prevWinners, randomWinner]);
      setDataset((prevDataset) =>
        prevDataset.filter((user) => user._id !== randomWinner._id)
      );
      setSpinCount((prevCount) => prevCount + 1);

      setShowConfetti(true); // Show confetti when winner is selected

      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }, 3000);
  };

  const resetGame = () => {
    setDataset([]);
    setWinnersList([]);
    setWinner(null);
    setSpinning(false);
    setSpinCount(0);
    setShowConfetti(false);
    localStorage.removeItem("winnersList");
    window.location.reload();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {showConfetti && <Confetti width={width} height={height} />} 

      <Typography sx={{ fontSize: 28, mb: 2, textAlign: "center", mb: 5 }}>
        Katpadi Mahamaya Lucky Winner List
      </Typography>

      <Stack direction={"row"} justifyContent={"space-evenly"}>
        <Stack>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Stack>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                inputProps={{ accept: ".xlsx,.xls" }}
                sx={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span">
                  Upload Excel File
                </Button>
              </label>
            </Stack>
            <Button onClick={resetGame} style={{ marginLeft: "10px" }}>
              Reset
            </Button>
          </Stack>

          {spinning ? (
            <Stack
              sx={{ mt: 30, width: 600, height: 420 }}
              direction={"row"}
              justifyContent={"center"}
            >
              <img src="./ezgif.webp" width={400} alt="" />
            </Stack>
          ) : (
            winner && (
              <Stack>
                <Stack
                  sx={{ width: 600, height: 600 }}
                  direction={"row"}
                  justifyContent={"center"}
                >
                  <img src="./prizePng.gif" width={1000} alt="" />
                </Stack>
                <Typography sx={{ fontSize: 40 }}>
                  {winner.name} 
                </Typography>
                <Typography sx={{ fontSize: 24 }}>({winner._id})</Typography>
                <Typography sx={{ color: "#aeaeae" }}>
                  Won lucky draw 🎉
                </Typography>
              </Stack>
            )
          )}
        {(spinning || dataset.length === 0 || spinCount >= spinNumber) === false &&(
          <Button
                    onClick={spinWheel}
                    sx={{ mt: 4, mb: 0 }}
                    disabled={spinning || dataset.length === 0 || spinCount >= spinNumber}
                  >
                    Spin 🎉
                  </Button>
        )}
          
        </Stack>

        <Stack mt={5}>
          <Typography sx={{ textAlign: "center", fontSize: 22, mb: 1 }}>
            Top 10 Winner List
          </Typography>
          <Stack direction={"row"} justifyContent={"center"}>
            <Stack width={600}>
              {winnersList.map((winner, index) => (
                <Box
                  key={winner._id}
                  sx={{
                    backgroundColor: "white",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                      <Avatar sx={{ width: 50, height: 50 }} />
                      <Stack direction={"column"} sx={{ textAlign: "left" }}>
                        <Typography sx={{ fontSize: 18 }}>
                          {winner.name}
                        </Typography>
                        <Typography sx={{ color: "#aeaeae" }}>
                          @{winner._id}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography sx={{ color: "red", fontSize: 12 }}>
                      #{index + 1}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default App;
