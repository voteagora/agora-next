import React from "react";

interface TruncatedAddressProps {
  address: string;
}

const TruncatedAddress: React.FC<TruncatedAddressProps> = ({ address }) => {
  const humanAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return <span>{humanAddress}</span>;
};

export default TruncatedAddress;