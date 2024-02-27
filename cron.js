import cron from "node-cron";
import axios from "axios";

const url =
  "http://localhost:8080/api/v1/product/awake-server";

function startCronJob() {
  const awakeServer = cron.schedule("* * * * * *", async () => {
    console.log("Starting cron job");

    try {
      const response = await axios.get(url);
      console.log("URL fetched successfully at", new Date());
    } catch (error) {
      console.error("Error fetching URL:", error.message);
    }
  });

  awakeServer.start();
}

export default startCronJob;
