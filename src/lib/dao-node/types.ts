interface DaoNodeDelegate {
  delegate: {
    addr: string;
    voting_power: string;
    from_cnt: number;
    from_list: [string, string][];
  };
}
