// Supabase client configuration
const SUPABASE_URL = "https://zkckxbjmhjdzgoaibpfp.supabase.co/";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2t4YmptaGpkemdvYWlicGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwOTQ0NzYsImV4cCI6MjA2MDY3MDQ3Nn0.y_vl3tSzNTVA1GK559Kq59P8xD32MvJWW83om6RMDRk";

// Create Supabase client

const createClient = () => {
  let currentSession = null;

  const client = {
    baseURL: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,

    auth: {
      signUp: async ({ email, password }) => {
        try {
          const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              email,
              password,
              data: {
                email_confirmed_at: new Date().toISOString(),
              },
            }),
          });

          const data = await response.json();
          if (response.ok) {
            currentSession = {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in,
              user: {
                id: data.user.id,
                email: data.user.email,
                aud: data.user.aud,
                role: data.user.role,
                created_at: data.user.created_at,
              },
            };

            await chrome.storage.local.set({ userSession: currentSession });
            return data;
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      },

      signInWithPassword: async ({ email, password }) => {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error_description || errorData.msg || "Login failed"
            );
          }

          const data = await response.json();

          currentSession = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            user: {
              id: data.user.id,
              email: data.user.email,
              aud: data.user.aud,
              role: data.user.role,
              created_at: data.user.created_at,
            },
          };

          await chrome.storage.local.set({ userSession: currentSession });

          return {
            data: { session: currentSession },
            error: null,
          };
        } catch (error) {
          return {
            data: null,
            error: {
              message: error.message || "Login failed",
            },
          };
        }
      },

      signOut: async () => {
        try {
          if (currentSession?.access_token) {
            await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${currentSession.access_token}`,
              },
            });
          }
          currentSession = null;
          await chrome.storage.local.remove("userSession");
          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      getSession: async () => {
        if (!currentSession) {
          const saved = await chrome.storage.local.get("userSession");
          currentSession = saved.userSession || null;
        }
        return { data: { session: currentSession }, error: null };
      },

      user: () => currentSession?.user || null,
    },

    from: function (table) {
      return {
        insert: async (data) => {
          try {
            const saved = await chrome.storage.local.get("userSession");
            if (!saved.userSession?.access_token) {
              throw new Error("Not authenticated");
            }

            const dataWithUserId = Array.isArray(data) ? data : [data];
            const dataToInsert = dataWithUserId.map((item) => ({
              ...item,
              user_id: saved.userSession.user.id,
            }));

            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${saved.userSession.access_token}`,
                Prefer: "return=representation", // Change this to return the inserted data
              },
              body: JSON.stringify(dataToInsert),
            });

            if (!response.ok) {
              const error = await response.json();
              throw error;
            }

            const insertedData = await response.json();
            return { data: insertedData, error: null }; // Return the inserted data
          } catch (error) {
            return {
              data: null,
              error: { message: error.message || "Failed to save data" },
            };
          }
        },
        select: async (columns) => {
          try {
            const saved = await chrome.storage.local.get("userSession");
            if (!saved.userSession?.access_token) {
              throw new Error("Not authenticated");
            }

            const response = await fetch(
              `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`,
              {
                headers: {
                  apikey: SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${saved.userSession.access_token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            return { data, error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
      };
    },
  };

  return client;
};

// Initialize the client
window.supabaseClient = createClient();
