import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import { OrderSevaFormPage, type OrderType } from "./order-seva-form-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: OrderType; userRoleId?: number }>;
}) {
  const rawParams = await searchParams;
  const type: OrderType = rawParams.type ?? "National";
  const userRoleId = rawParams.userRoleId;

  const headerConfig = {
    National: {
      title: "National Order",
      subTitle: "Pune - Sevadar",
      icon: IMAGES.indiaFlag,
      titleColor: "text-slate-900",
      bgGradient: "from-blue-50/50 to-purple-50/50",
    },
    Emergency: {
      title: "Emergency Order",
      subTitle: "Pune - Sevadar",
      icon: IMAGES.nationalEmergency,
      titleColor: "text-red-600",
      bgGradient: "from-red-50/50 to-orange-50/50",
    },
    International: {
      title: "International Order",
      subTitle: "Pune - Sevadar",
      icon: IMAGES.world,
      titleColor: "text-slate-900",
      bgGradient: "from-teal-50/50 to-blue-50/50",
    },
  }[type];

  return (
    <>
      <PageHeader
        title={headerConfig.title}
        icon={headerConfig.icon}
        titleClassName={headerConfig.titleColor}
      />

      <OrderSevaFormPage type={type} userRoleId={userRoleId} />
    </>
  );
}
