import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { SevadarListPageComponent } from "@/components/SevadarListPageComponent";
import type { NextApplicationPage } from "@/shared/interfaces/app";

const SevadarListPage: NextApplicationPage = () => {
  const router = useRouter();

  if (!router.query.sevaType) {
    return null;
  }

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Social Media Sevadar List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <SevadarListPageComponent group={router.query.sevaType as string} />
      </div>
    </Layout>
  );
};

SevadarListPage.requireAuth = true;

export default SevadarListPage;
