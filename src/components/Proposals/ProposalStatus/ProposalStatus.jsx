import styles from "./proposalStatus.module.scss";

export default function ProposalStatus({ proposal }) {
  const testProposals = [
    "90839767999322802375479087567202389126141447078032129455920633707568400402209",
    "103606400798595803012644966342403441743733355496979747669804254618774477345292",
    "89934444025525534467725222948723300602129924689317116631018191521555230364343",
    "28601282374834906210319879956567232553560898502158891728063939287236508034960",
  ];

  let statusClass = `status-${proposal.status
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
  let statusText = proposal.status;

  if (testProposals.includes(proposal.id)) {
    statusClass = "status-test"; // Assuming you have a CSS class for this
    statusText = `TEST: ${proposal.status}`;
  } else if (statusText === "SUCCEEDED") {
    statusClass = "status-succeeded";
  }

  return <div className={styles[statusClass]}>{statusText}</div>;
}
