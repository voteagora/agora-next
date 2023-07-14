"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import HumanAddress from "../shared/HumanAddress";

export const ProposalsList = ({ list }) => {
  const router = useRouter();

  const viewProposal = (proposalId) => {
    router.push(`/proposals/${proposalId}`);
  };

  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <table className="w-full text-left">
            <tbody>
              {list.map((proposal) => (
                <tr
                  className="cursor-pointer"
                  key={proposal.id}
                  onClick={() => viewProposal(proposal.uuid)}
                >
                  <td className="relative py-5 pr-6">
                    <div className="flex gap-x-6">
                      <div className="flex-auto">
                        <div className="">
                          <div className="flex leading-8 text-xs text-gray-500">
                            <p className="flex-auto">
                              Prop {proposal.uuid} by {" "}
                              <HumanAddress address={proposal.proposer_addr} />
                            </p>
                          </div>
                          <div className="proposal_list_title text-gray-600">
                            <ReactMarkdown>
                              {
                                proposal.description
                                  .replace(/\\n/g, "\n")
                                  .split("\n")[0]
                              }
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                    <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                  </td>
                  <td className="relative py-5 pr-6">
                    <div className="text-sm leading-6 text-gray-900">
                      {proposal.status}
                    </div>
                  </td>
                  <td className="hidden py-5 pr-6 sm:table-cell">
                    <div className="mt-1 justify-center leading-5 text-gray-500">
                      <div className="flex text-xs">Requesting</div>
                      <div className="mt-1 leading-5 text-gray-500">
                        --- ETH
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProposalsList;
