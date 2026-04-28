import DisclaimerBanner from "@/components/DisclaimerBanner/DisclaimerBanner";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <DisclaimerBanner />
    </>
  );
}
