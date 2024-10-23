import axios from "axios";

export const UreadingWord = async (words: any, isRead: number) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/uread", {
      words: words,
      isRead: isRead,
    });

    const result = response.data;

    switch (result) {
      case "success":
        return "success";
      case "error":
        return "error";
    }
  } catch (e) {
    console.log(e);
  }
};
