/** What requireAuth attaches to every authenticated request's context. */
export type AppVariables = {
  userId: string
  userEmail: string
  userRole: string
}

export type AppEnv = { Variables: AppVariables }
