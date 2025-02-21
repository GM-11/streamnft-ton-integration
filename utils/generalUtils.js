const delay = (ms) => new Promise((res) => setTimeout(res, ms));
import axios from "axios";
import jwt from "jsonwebtoken";
import { utilityAxiosInstance } from "../services/axios";

const REFRESH_THRESHOLD = 3600; // 1 hour in seconds

export async function getEventsFromMirror(contractId, abiInterface) {
  await delay(10000);

  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=asc`;

  try {
    let index;
    const response = await axios.get(url);
    const logs = response.data.logs;

    logs.forEach((log) => {
      let logRequest = { data: log.data, topics: log.topics };
      let event = abiInterface.parseLog(logRequest);

      if (event && event.name === "UtilityAdded") {
        index = event.args[2];

        if (!index) {
          throw new Error("Invalid index in UtilityAdded event");
        }

        return index;
      } else {
        throw new Error("No UtilityAdded event");
      }
    });
  } catch (error) {
    console.error("Error fetching logs from mirror node:", error);
  }
}

export const refreshToken = async () => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: token,
  };

  try {
    const response = await utilityAxiosInstance.post(
      "/login/token",
      {
        refresh_token: refreshToken,
      },
      {
        headers: headers,
      }
    );
    localStorage.setItem("token", response?.data?.token);
    localStorage.setItem("refreshToken", response?.data?.refreshToken);
  } catch (error) {
    console.error("Failed to refresh token:", error);
  }
};

export const isTokenExpired = async () => {
  const token = localStorage.getItem("token");

  const decodedToken = jwt.decode(token);

  if (!decodedToken) {
    return false;
  }

  return decodedToken.exp * 1000 < Date.now() + 30 * 60 * 1000;
};

export const removeHTMLTags = (htmlString) => {
  if (!htmlString) {
    return "";
  }
  return htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
};
