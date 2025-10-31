import {z} from "zod";
// export const AppConfig = {
//   supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
//   supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
//   supabaseBucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "",
//   powersyncUrl: process.env.EXPO_PUBLIC_POWERSYNC_URL,
// };

export const envVariablesSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  EXPO_PUBLIC_SUPABASE_BUCKET: z.string().default(""),
  EXPO_PUBLIC_POWERSYNC_URL: z.url(),
});

export const envVariables = envVariablesSchema.parse(process.env);
