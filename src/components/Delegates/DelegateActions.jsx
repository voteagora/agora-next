import { css } from "@emotion/css";
import { Button } from "../Button";
import { HStack } from "../Layout/Stack";

// TODO: add twitter and discord links (from delegate statement)
export function DelegateActions({ className, address }) {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="stretch"
      className={className}
    >
      {false && <DelegateSocialLinks discord={null} twitter={null} />}
      <DelegateButton full={true} address={address} />
    </HStack>
  );
}

function DelegateButton({ full, address }) {
  const makeDelegation = async () => {
    // TODO: write to token contract
  };

  return (
    <Button
      onClick={() => {
        makeDelegation();
      }}
      className={
        full &&
        css`
          width: 100%;
        `
      }
    >
      Delegate
    </Button>
  );
}

function DelegateSocialLinks({ discord, twitter }) {
  return (
    <></>
    // <HStack gap="4" alignItems="center">
    //   {twitter && (
    //     <Button
    //       className={css`
    //         padding: ${theme.spacing["1"]};
    //       `}
    //       href={`https://twitter.com/${twitter}`}
    //     >
    //       <img src={icons.twitter} alt="twitter" />
    //     </Button>
    //   )}

    //   {discord && (
    //     <Button
    //       onClick={(e) => {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         toast("copied discord handle to clipboard");

    //         navigator.clipboard.writeText(discord);
    //       }}
    //     >
    //       <img src={icons.discord} alt="discord" />
    //     </Button>
    //   )}
    // </HStack>
  );
}
