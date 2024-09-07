declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv extends Dict<string> {
        FREEE_CLIENT_ID: string;
        FREEE_CLIENT_SECRET: string;
        AUTH_SECRET: string;
      }
    }
  }
}
