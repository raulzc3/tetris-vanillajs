import { fetchApi } from "../utils/fetchFunctions";

export async function getScores(limit = 10) {
  const resultLimit = limit > 0 ? limit : 10;
  try {
    const scores = await fetchApi(`/scores?limit=${resultLimit}`, {
      method: "get",
    });
    return scores.data;
  } catch (err) {
    console.log(err);
  }
}

export async function saveScore({ name, score }) {
  try {
    const data = await fetchApi("/scores/add", {
      method: "post",
      body: {
        name,
        score,
      },
    });
    // console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
}
