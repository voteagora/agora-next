'use client';

import { startTransition, useState } from 'react';
import type { ProposalRecord } from '@/lib/vibdao/types';

type ProposalMetadataEditorProps = {
  proposal: ProposalRecord;
};

export function ProposalMetadataEditor({ proposal }: ProposalMetadataEditorProps) {
  const [title, setTitle] = useState(proposal.metadata?.title ?? proposal.proposalType);
  const [summary, setSummary] = useState(proposal.metadata?.summary ?? proposal.description ?? '');
  const [body, setBody] = useState(proposal.metadata?.body ?? '');
  const [message, setMessage] = useState<string | null>(null);

  const save = () => {
    startTransition(() => {
      void fetch(`/api/vibdao/proposal-metadata/${proposal.proposalId}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title, summary, body }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(await response.text());
          }
          setMessage('Metadata saved');
        })
        .catch((error) => {
          setMessage(error instanceof Error ? error.message : 'Failed to save metadata');
        });
    });
  };

  return (
    <div className="panel">
      <div className="panelHeader">
        <h3>Proposal Metadata</h3>
      </div>
      <div className="stackMd">
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Summary</span>
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} />
        </label>
        <label className="field">
          <span>Body</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} />
        </label>
        <button className="button secondary" onClick={save}>
          Save Metadata
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </div>
    </div>
  );
}
