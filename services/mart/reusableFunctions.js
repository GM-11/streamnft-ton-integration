export const referralRegisterCall = async (body) => {
    try {
      const response = await axios.post(
        `${scoreBaseURL ?? "https://user-dev.danlabs.xyz"}/refer/wallet`,
        body
      );
  
      if (response?.data) {
        localStorage.removeItem("referralCode");
      }
  
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      return { data: [] };
    }
  };