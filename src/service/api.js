import axios from "axios";

const baseURL = "https://aircall-backend.onrender.com/activities";

const instance = axios.create({
  responseType: "json",
  baseURL: baseURL,
});

export const getCalls = () => {
  return instance
    .get("/")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching calls:", error);
      throw error;
    });
};

export const getCallById = (call_id) => {
  return instance
    .get(`/${call_id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error fetching call with ID ${call_id}:`, error);
      throw error;
    });
};

export const updateCallsArchiveStatus = (callIds, isArchived) => {
  const promises = callIds.map((callId) => {
    return instance
      .patch(`/${callId}`, { is_archived: isArchived })
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error updating call with ID ${callId}:`, error);
        throw error;
      });
  });

  return Promise.all(promises);
};
