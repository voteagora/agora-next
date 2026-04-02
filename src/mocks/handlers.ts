import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Delegate Transactions
  http.post(/.*\/delegate\/tx.*/, () => {
    return HttpResponse.json({ success: true, transactionHash: "0xdef456" });
  }),

  // Mock Create Proposal Transactions
  http.post(/.*\/proposals\/create.*/, () => {
    return HttpResponse.json({ success: true, draftId: "12345" });
  })
];
