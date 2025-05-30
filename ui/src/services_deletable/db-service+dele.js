const API_BASE_URL = "http://localhost:3000/api";

export const dbService = {
  // Add a new user to the database
  async addUser(name, email) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },
};
