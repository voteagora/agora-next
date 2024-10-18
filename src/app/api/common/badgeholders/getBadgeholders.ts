import { CATEGORY_ROLES } from "@/app/lib/auth/constants";
import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import Tenant from "@/lib/tenant/tenant";
import prisma from "@/app/lib/prisma";

const allowlist = [
  "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
  "0x92084bed8635d82db600e100539a61a6d4209403",
  "0x2410d50ba4993c1fe13b3db0bcdae51b1c617d0a",
  "0x6aaa8733cfee3931d826c2d2ad4679db9accf6bb",
  "0xe3b4b326d34686ea3a44dfa1e19e5ffd0dff04f3",
  "0xe21da99ccdede771d28178c976c0f30763dc043f",
  "0x143c777f650ad8d00942d497ee66f4d774427195",
  "0xe21da99ccdede771d28178c976c0f30763dc043f",
  "0xa1179f64638adb613ddaac32d918eb6beb824104",
  "0x6d97d65adff6771b31671443a6b9512104312d3d",
];

const citizenAllowlist = ["0xe3b4b326d34686ea3a44dfa1e19e5ffd0dff04f3"];

const getBadgeholder = async (addressOrEnsName: string) =>
  addressOrEnsNameWrap(getBadgeholderForAddress, addressOrEnsName);

async function getBadgeholderForAddress({ address }: { address: string }) {
  const { slug } = Tenant.current();

  const badgehodler = await prisma.badgeholders.findFirst({
    where: {
      dao_slug: slug,
      address: address,
      retro_funding_round: "5",
    },
  });

  return {
    isBadgeholder: !!badgehodler || allowlist.includes(address),
    isCitizen:
      (badgehodler?.metadata
        ? JSON.parse(badgehodler.metadata).voterType === "Citizen"
        : false) || citizenAllowlist.includes(address),
    votingCategory: badgehodler
      ? parseVotingCategory(JSON.parse(badgehodler.metadata).votingGroup)
      : randomVotingCategory(address),
  };
}

export const fetchBadgeholder = cache(getBadgeholder);

function parseVotingCategory(category: "A" | "B" | "C") {
  switch (category) {
    case "A":
      return Object.entries(CATEGORY_ROLES)[0][1];
    case "B":
      return Object.entries(CATEGORY_ROLES)[1][1];
    case "C":
      return Object.entries(CATEGORY_ROLES)[2][1];
  }
}

function randomVotingCategory(address: string) {
  // get a number seeded by the address
  const seed = parseInt(address.slice(2, 10), 16);
  const categoryIndex = seed % Object.keys(CATEGORY_ROLES).length;
  return Object.entries(CATEGORY_ROLES)[categoryIndex][1];
}
