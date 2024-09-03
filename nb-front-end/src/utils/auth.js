export const isAuthenticated = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
      const response = await fetch("http://localhost:8080/protected/home", {
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