import { HStack, VStack } from "@/components/Layout/Stack";
import { Link } from "../../components/HammockRouter/Link";
import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { RetroPGFListRowFragment$key } from "./__generated__/RetroPGFListRowFragment.graphql";
import { NounResolvedName } from "../../components/NounResolvedName";
import { ENSAvatar } from "../../components/ENSAvatar";
import { icons } from "../../icons/icons";
import ProjectPlaceholder from "./ProjectPlaceholder.svg";
import { useLikes } from "./RetroPGFVoterStore/useLikes";
import { useSIWE } from "connectkit";
import { cn } from "@/lib/utils";
import Image from "next/image";

// TODO: frh -> data and page
export default function RetroPGFListRow({
  fragmentRef,
}: {
  fragmentRef: RetroPGFListRowFragment$key;
}) {
  const list = useFragment(
    graphql`
      fragment RetroPGFListRowFragment on List {
        id
        author {
          resolvedName {
            ...NounResolvedNameFragment
            ...ENSAvatarFragment
          }
        }
        listName
        listDescription
        categories
        listContentCount
        listContentShort {
          project {
            displayName
            profile {
              profileImageUrl
            }
          }
        }
      }
    `,
    fragmentRef
  );

  const MAX_APPLICATION_PER_ROW = 12;
  const extraAppsCount = Math.max(
    0,
    list.listContentCount - MAX_APPLICATION_PER_ROW
  );

  const { isSignedIn } = useSIWE();

  const { likesForList, isListLiked, likeList } = useLikes();

  return (
    <HStack className="justify-between items-center m-0 h-full border-b border-b-gray-300 max-w-6xl p-4">
      <VStack className="pr-0 sm:pr-16 flex-1 items-stretch max-w-full sm:max-w-[50%]">
        {/* TODO: frh -> list page */}
        <Link to={`/retropgf/3/list/${parseListId(list.id)}`}>
          <div className="font-medium">{list.listName}</div>
          <div
            // TODO: frh -> check if flex is same as display: -webkit-box and also some styles due to line-clamp
            className="flex break-words text-gray-700 overflow-hidden text-ellipsis text-base leading-normal line-clamp-1"
          >
            {list.listDescription}
          </div>
        </Link>
        <HStack className="items-center text-sm text-gray-700 mt-2">
          {/* TODO: frh -> this */}
          {/* <HStack className="gap-1 items-center">
            <ENSAvatar
              className={css`
                width: 20px;
                height: 20px;
                border-radius: 100%;
                margin: 2px;
              `}
              fragment={list.author.resolvedName}
            />
            <NounResolvedName resolvedName={list.author.resolvedName} />
          </HStack> */}
          <span className="text-[#e0e0e0] my-0 mx-3">|</span>
          {/* TODO: frh -> this */}
          {/* <HStack className="items-center gap-1">
            <img
              src={
                isListLiked(parseListId(list.id)) ? icons.heartRed : icons.heart
              }
              alt={"likes"}
              className={css`
                width: ${theme.spacing["4"]};
                height: ${theme.spacing["4"]};
                cursor: ${isSignedIn ? "pointer" : "default"};
              `}
              onClick={() => {
                likeList(parseListId(list.id));
              }}
            />
            {likesForList(parseListId(list.id))}
          </HStack> */}
        </HStack>
      </VStack>
      <Link to={`/retropgf/3/list/${parseListId(list.id)}`}>
        <VStack className="hidden sm:flex justify-between gap-4 overflow-x-auto flex-1 h-full">
          <HStack className="justify-end">
            {list.listContentShort
              .slice(0, MAX_APPLICATION_PER_ROW)
              .map((app, index) => (
                // TODO: frh -> check placeholder and index and translate-x
                <Image
                  key={index}
                  src={
                    app.project.profile?.profileImageUrl ?? ProjectPlaceholder
                  }
                  alt={`${app.project.displayName} icon`}
                  className={cn(
                    "relative border-[3px] border-black rounded-[8px] bg-white shadow-newDefault",
                    "top-[200px] sm:top-auto left-1/2 -translate-x-1/2 sm:translate-x-0",
                    `sm:left-[${-index * 8}px] z-[${index}]`
                  )}
                  width="40"
                  height="40"
                />
              ))}
            {extraAppsCount > 0 && (
              <div
                // TODO: frh -> check bg color matches
                className={cn(
                  "box-border bg-white border-2 border-white rounded-[8px] shadow-newDefault w-[35px] h-[35px] text-gray-4f",
                  "flex justify-center items-center relative font-inter font-semibold text-xs leading-4 -left-[84px] z-20"
                )}
              >
                +{extraAppsCount}
              </div>
            )}
          </HStack>
          <HStack>
            <CategoryListItem categories={list.categories}></CategoryListItem>
          </HStack>
        </VStack>
      </Link>
    </HStack>
  );
}

const CategoryListItem = ({
  categories,
}: {
  categories: readonly string[];
}) => {
  return (
    // TODO: frh -> check alignment of flex
    <HStack className="gap-1 flex flex-wrap">
      {categories.slice(0, 3).map((category) => (
        <div
          key={category}
          className="bg-gray-fa gap-0 text-xs text-gray-700 whitespace-nowrap flex items-center justify-center rounded-full py-0 px-2"
        >
          {formatCategory(category)}
        </div>
      ))}
      {categories.length > 3 && (
        <div className="bg-gray-fa gap-0 text-xs text-gray-700 whitespace-nowrap flex items-center justify-center rounded-full py-0 px-2">
          + more
        </div>
      )}
    </HStack>
  );
};

function formatCategory(category: string) {
  switch (category) {
    case "OP_STACK":
      return "OP stack";
    case "END_USER_EXPERIENCE_AND_ADOPTION":
      return "End user experience & adoption";
    default:
      return (
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      )
        .split("_")
        .join(" ");
  }
}

function parseListId(listId: string): string {
  return listId.split("|")[1];
}
