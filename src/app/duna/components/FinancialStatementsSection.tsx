"use client";

import React from "react";
import FinancialStatementCard from "./FinancialStatementCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FinancialStatement {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
}

interface FinancialStatementsSectionProps {
  statements: FinancialStatement[];
  onStatementClick: (statement: FinancialStatement) => void;
  title: string;
}

export default function FinancialStatementsSection({
  statements,
  onStatementClick,
  title,
}: FinancialStatementsSectionProps) {
  if (statements.length === 0) return null;

  const now = new Date();
  const sortedStatements = [...statements].sort((a, b) => {
    const dateA = new Date(a.revealTime ?? a.createdAt);
    const dateB = new Date(b.revealTime ?? b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const mostRecentStatement = sortedStatements[0];
  const isRecentlyReleased =
    mostRecentStatement &&
    new Date(mostRecentStatement.revealTime ?? 0).getTime() >
      now.getTime() - 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold text-primary mb-4">{title}</h4>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {sortedStatements.map((statement, index) => {
            return (
              <CarouselItem key={statement.id} className="pl-4 basis-auto">
                <FinancialStatementCard
                  document={statement}
                  onCardClick={() => onStatementClick(statement)}
                  isRecentlyReleased={index === 0 && isRecentlyReleased}
                  index={index}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
