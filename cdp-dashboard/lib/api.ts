// Use the environment variable for the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cdpapi-demo.onrender.com"

// Helper function for API requests with better error handling
async function fetchAPI(endpoint: string, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    console.log(`Fetching from: ${url}`)

    // Add a timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options as any).headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error(`API request error for ${url}:`, error)

    // Check for specific error types
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Is your backend server running?")
    } else if (error.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to the backend server. Please check if it's running.")
    }

    throw error
  }
}

// Dashboard stats
export async function getStats() {
  return fetchAPI("/api/stats")
}

// Users
export async function getUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit
  return fetchAPI(`/api/users?skip=${skip}&limit=${limit}`)
}

export async function getUserById(id: string) {
  return fetchAPI(`/api/users/${id}`)
}

export async function createUser(userData: any) {
  return fetchAPI("/ingest-single/bulk-json ingest", {
    method: "POST",
    body: JSON.stringify([userData]),
  })
}

export async function updateUser(userData: any) {
  return fetchAPI("/ingest-single/bulk-json ingest", {
    method: "POST",
    body: JSON.stringify([userData]),
  })
}
// Cohorts
export async function getCohorts() {
  const res = await fetchAPI(`/api/users?skip=0&limit=1000`);
  return res.users; // assuming the response format is { users: [...] }
}


// Segments
export async function getSegments() {
  // Your backend doesn't have a specific segments endpoint yet
  // This could be implemented later
  return fetchAPI("/api/segments").catch(() => ({ segments: [] }))
}

// Data Ingestion
export async function uploadFile(formData: FormData) {
  return fetch(`${API_BASE_URL}/bulk-ingest`, {
    method: "POST",
    body: formData,
  }).then((res) => res.json())
}

// Predictions
export async function runPrediction(data: any) {
  return fetchAPI("/bulk-predict", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Training
export async function trainModel() {
  return fetchAPI("/train", {
    method: "POST",
  })
}

