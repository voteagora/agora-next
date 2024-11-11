"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import {
  DEFAULT_FORM,
  parseToForm,
  schema as requestSponsorshipSchema,
} from "../../schemas/requestSponsorshipSchema";
import { DraftProposal } from "../../types";
import DraftPreview from "../DraftPreview";
import RequestSponsorshipForm from "../RequestSponsorshipForm";

const SubmitForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
  const methods = useForm<z.output<typeof requestSponsorshipSchema>>({
    resolver: zodResolver(requestSponsorshipSchema),
    defaultValues: parseToForm(draftProposal) || DEFAULT_FORM,
  });

  return (
    <FormProvider {...methods}>
      <form>
        <DraftPreview
          proposalDraft={draftProposal}
          actions={<RequestSponsorshipForm draftProposal={draftProposal} />}
        />
      </form>
    </FormProvider>
  );
};

export default SubmitForm;
