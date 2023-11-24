import styles from "./proposalStatus.module.scss";

export default function ProposalStatus({ proposal }) {
  const testProposals = [
    "90839767999322802375479087567202389126141447078032129455920633707568400402209",
    "103606400798595803012644966342403441743733355496979747669804254618774477345292",
    "89934444025525534467725222948723300602129924689317116631018191521555230364343",
    "28601282374834906210319879956567232553560898502158891728063939287236508034960",
  ];

  const carlosHack = [
    "25353629475948605098820168047140307200589226219380649297323431722674892706917",
  ];

  let statusClass = `status-${proposal.status
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
  let statusText = proposal.status;

  if (testProposals.includes(proposal.number)) {
    statusClass = "status-test"; // Assuming you have a CSS class for this
    statusText = `TEST PROP: ${proposal.status}`;
  } else if (carlosHack.includes(proposal.number)) {
    statusClass = "status-defeated"; // Use the defeated class for the Carlos hack
    statusText = "DEFEATED";
  }

  return <div className={styles.statusClass}>{statusText}</div>;
}
