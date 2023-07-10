import React from "react";

const TruncatedAddress = ({ address }) => {
  const humanAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return <span>{humanAddress}</span>;
};

export default TruncatedAddress;
