import { accounts } from "../Social"

export const appName = "Agora"
export const appTitle = `${appName} – The future of governance`
export const appDescription = "Agora is a decentralized governance platform."
export const appUrl = process.env.NEXT_PUBLIC_APP_URL!
export const domain = appUrl.split("//").pop()
export const twitterAccount = accounts.twitter?.split("twitter.com/").pop()
