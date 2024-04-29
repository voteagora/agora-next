"use server";

import CreateStake from "../../components/CreateStake";

export default async function Page({ params: { deposit_id } }) {
  return <CreateStake />;
}
