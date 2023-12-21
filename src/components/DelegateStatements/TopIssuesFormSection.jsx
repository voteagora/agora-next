import { useCallback } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import { Input } from "@/components/ui/input";

// TODO: frh -> check this other exports where should they
export const issueDefinitions = [
  {
    title: "Treasury management",
    key: "treasury",
    icon: "piggyBank",
  },
  {
    title: "Grant funding",
    key: "funding",
    icon: "measure",
  },
  {
    title: "Public goods",
    key: "publicGoods",
    icon: "ballot",
  },
];

function initialIssueState(type) {
  return {
    type,
    value: "",
  };
}

export function initialTopIssues() {
  return [initialIssueState("treasury"), initialIssueState("funding")];
}

export default function TopIssuesFormSection({ form }) {
  console.log("form: ", form);
  const topIssues = form.state.topIssues;
  const setTopIssues = form.onChange.topIssues;

  const addIssue = useCallback(
    (selectionKey) => {
      setTopIssues((lastIssues) => {
        return [...lastIssues, initialIssueState(selectionKey)];
      });
    },
    [setTopIssues]
  );

  const removeIssue = useCallback(
    (index) => {
      setTopIssues((lastIssues) =>
        lastIssues.filter((needle, needleIndex) => needleIndex !== index)
      );
    },
    [setTopIssues]
  );

  const updateIssue = useCallback(
    (index, value) => {
      setTopIssues((lastIssues) =>
        lastIssues.map((issue, needleIdx) => {
          if (needleIdx === index) {
            return {
              ...issue,
              value,
            };
          }

          return issue;
        })
      );
    },
    [setTopIssues]
  );

  return (
    <div className="py-8 px-6 border-b border-gray-300">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-baseline">
        <h3 className="font-bold">Views on top issues</h3>
        {/* <Dropdown addIssue={addIssue} /> */}
      </div>

      <VStack className="gap-4 mt-6">
        {topIssues.map((issue, index) => {
          const issueDef = issueDefinitions.find(
            (needle) => issue.type === needle.key
          );

          return (
            <HStack className="gap-4 items-center" key={issue.type}>
              <div className="flex justify-center items-center w-12 h-12 min-w-12 bg-white rounded-md border border-gray-300 shadow-newDefault p-2">
                <Image src={icons[issueDef.icon]} alt={issueDef.title} />
              </div>

              <VStack className="flex-1 relative">
                <VStack className="absolute right-0 top-0 bottom-0">
                  {/* //  TODO: frh -> closeButton and index of issue  */}
                  {/* <CloseButton onClick={() => removeIssue(index)} /> */}
                </VStack>
                <Input
                  className="pr-12"
                  variant="bgGray100"
                  inputSize="md"
                  type="text"
                  placeholder={`On ${issueDef.title.toLowerCase()}, I believe...`}
                  value={issue.value}
                  onChange={(evt) => updateIssue(index, evt.target.value)}
                />
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </div>
  );
}

// TODO: frh -> shadcnui
// export function DropdownItems({ open, children }) {
//   return (
//     <div
//       className={css`
//         position: absolute;
//         z-index: 100;
//         outline: none;

//         top: calc(100% + ${theme.spacing["2"]});
//         right: 0;
//       `}
//     >
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             style={{ originY: "-100%", originX: "100%" }}
//             initial={{ opacity: 0, scale: 0.9 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.15 }}
//           >
//             <VStack
//               gap="1"
//               className={css`
//                 background: #f7f7f7;
//                 box-shadow: ${theme.boxShadow.newDefault};
//                 border: 1px solid ${theme.colors.gray.eb};
//                 padding: ${theme.spacing["2"]};
//                 border-radius: ${theme.spacing["4"]};
//               `}
//             >
//               {children}
//             </VStack>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// Dropdown with shadcnui
// function Dropdown({ addIssue }: DropdownProps) {
//   return (
//     <Menu as="div" className={dropdownContainerStyles}>
//       {({ open }) => (
//         <>
//           <Menu.Button
//             className={css`
//               color: #66676b;
//             `}
//           >
//             + Add a new issue
//           </Menu.Button>
//           <Menu.Items static>
//             <DropdownItems open={open}>
//               {issueDefinitions.map((def) => (
//                 <Menu.Item key={def.key}>
//                   {({ active }) => (
//                     <div
//                       onClick={() => addIssue(def.key)}
//                       className={css`
//                         ${dropdownItemStyle};
//                         ${active && dropdownItemActiveStyle}
//                       `}
//                     >
//                       {def.title}
//                     </div>
//                   )}
//                 </Menu.Item>
//               ))}
//             </DropdownItems>
//           </Menu.Items>
//         </>
//       )}
//     </Menu>
//   );
// }
