const faqs = [
  {
    question: "I have this very complex question can you help?",
    answer:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    question: "I have this very complex question can you help?",
    answer:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    question: "I have this very complex question can you help?",
    answer:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
];
export default function FAQs() {
  return (
    <div className="mt-10 ">
      <h1 className="font-black text-2xl text-black">FAQ</h1>
      <div className="mt-[18px]">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h2 className="font-medium text-base text-black mt-4 ">
              {faq.question}
            </h2>
            <p className="mt-2 text-base font-medium text-gray-4f">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
