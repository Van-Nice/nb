export const isAuthenticated = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  const apiUrl = process.env.REACT_APP_API_URL;

  try {
      const response = await fetch(`${apiUrl}/api/protected/`, {
          method: "GET",
          headers: {
              "Authorization": token,
          },
      });

      if (response.status === 200) {
          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error("Error during authentication check:", error);
      return false;
  }
};

export const logout = () => {
    localStorage.removeItem("userID");
    localStorage.removeItem("authToken");
}