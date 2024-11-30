import cors from "cors";
import express from "express";

const app = express();

app.use(express.static("public"));

app.use("/", express.static("public"));
app.use(cors());

app.get("/event-source", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  /*
  Store business logic here - Fetch from external sources (Message broker)
  */
  let counter = 0;
  let interval = setInterval(() => {
    counter++;
    if (counter > 10) {
      clearInterval(interval);
      res.end();
    }
    // res.write(`event: interval\n`);
    res.write(`id: interval${counter} \n`);
    res.write(`data: ${JSON.stringify({ num: counter })}\n\n`);
  }, 1000);

  res.on("close", () => {
    clearInterval(interval);

    res.end();
  });
});

app.listen(3004, () => {
  console.log(`Example app listening at http://localhost:${3004}`);
});
