import type { TransferSevadar } from "@/shared/interfaces/transfer";

/**
 * Maps a `disciple_with_role` list item to the shape rendered in the transfer
 * cards. The disciple is nested under `disciple` and the mobile number sits on
 * the parent user record.
 */
export function toTransferSevadar(item: any): TransferSevadar {
  const disciple = item?.disciple ?? item ?? {};

  return {
    id: disciple.id ?? item?.id ?? 0,
    name: disciple.name ?? "",
    avatar: disciple.avatar ?? "",
    relation: disciple.relation ?? "",
    guardian_name: disciple.guardian_name ?? "",
    mobile_no: item?.mobile_no ?? disciple.mobile_no ?? "",
    district: disciple.district?.name ?? disciple.district ?? "",
    state: disciple.state?.name ?? disciple.state ?? "",
    created_at: disciple.created_at ?? "",
  };
}
