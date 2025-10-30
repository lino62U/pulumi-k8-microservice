import api from '../config/axiosConfig';

export const runStressTest = async (): Promise<void> => {
  // Create an array of 50 promises for concurrent requests
  const requests = Array.from({ length: 50 }, () =>
    // NGINX forwards requests from /stress/ to the stress microservice
    api.get("/stress/heavy_task", {
      params: { seconds: 2 },
    })
  );

  // Wait for all requests to complete
  await Promise.all(requests);
};
