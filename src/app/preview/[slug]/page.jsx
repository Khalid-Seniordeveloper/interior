import PreviewPage from "@/pages/previewpage/reviewPage";

const Page = async ({ params }) => {
  const { slug } = await params;

  return (
    <>
      <PreviewPage chatId={slug} />
    </>
  );
};

export default Page;
