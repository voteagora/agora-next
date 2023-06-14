import Link from "next/link"
import {
  Blog,
  Discord,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Notion,
  Reddit,
  Twitter
} from "ui/icons/Social"

type SocialTypeKeys =
  | "twitter"
  | "discord"
  | "github"
  | "notion"
  | "blog"
  | "facebook"
  | "instagram"
  | "reddit"
  | "linkedin"
  | "mail"

type SocialTypeValues = {
  color: string
  element: () => JSX.Element
}

export type SocialType = Record<SocialTypeKeys, SocialTypeValues>

type Props = {
  wrapperClassName?: string
}

export const accounts: Partial<Record<SocialTypeKeys, string>> = {
  twitter: "https://twitter.com/nounsagora"
  // discord: "https://discord.gg/CdyHUzdZks",
  // notion: "https://slicedao.notion.site",
  // github: "https://github.com/slice-so",
  // blog: "/blog",
}

const components: SocialType = {
  twitter: { color: "hover:text-blue-500", element: Twitter },
  discord: { color: "hover:text-indigo-500", element: Discord },
  github: { color: "hover:text-purple-500", element: Github },
  notion: { color: "hover:text-gray-500", element: Notion },
  blog: { color: "hover:text-green-500", element: Blog },
  facebook: { color: "hover:text-blue-700", element: Facebook },
  instagram: { color: "hover:text-pink-500", element: Instagram },
  reddit: { color: "hover:text-red-500", element: Reddit },
  linkedin: { color: "hover:text-blue-700", element: Linkedin },
  mail: { color: "hover:text-gray-500", element: Mail }
}

export default function Social({ wrapperClassName }: Props) {
  return (
    <div className={`${wrapperClassName} flex justify-center`}>
      {Object.entries(accounts).map(([socialAccount, url]) => {
        const accountsKey = socialAccount as SocialTypeKeys
        const { color, element } = components[accountsKey]
        const DynamicComponent = element
        const componentColor = color
        return (
          <Link
            key={socialAccount}
            className={`${componentColor} mx-[18px] h-6 w-6`}
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${accountsKey} logo`}
          >
            <DynamicComponent />
          </Link>
        )
      })}
    </div>
  )
}
