import { NextPage } from "next";

export type NextApplicationPage<P = any, IP = P> = NextPage<P, IP> & {
  requireAuth?: boolean;
};

export type Tab = {
  label: string;
  page: number;
  hasNext: boolean;
  query: string;
  [k: string]: string | number | boolean;
};

export enum BOOK_ORDER_STATUS {
  RECEIVED = 1,
  ACCEPTED = 2,
  DELIVERED = 3,
  BOOK_NOT_RECEIVE = 4,
  DELETED = 5,
  DIFFERENT_AREA = 6,
  DUPLICATED = 7,
  EMERGENCY = 8,
  WRONG_ORDER = 9,
  BY_POST = 10,
  ALLOTTED = 11,
  DISTRICT_ACCEPT = 12,
  DISTRICT_REJECT = 13,
}

export enum DUPLICATE_ORDER_STATUS {
  RECEIVED = 1,
  ALLOTTED = 2,
  ACCEPT = 3,
  REJECT = 4,
}

export enum INCOMPLETE_ORDER_STATUS {
  RECEIVED = 1,
  ALLOTTED = 2,
  WANT_BOOK = 3,
  NOT_INTERESTED = 4,
  OUT_OF_REACH = 5,
}

export enum PINCODE_ORDER_STATUS {
  RECEIVED = 1,
  ALLOTTED = 2,
  SAVE_ADDRESS = 3,
  INCOMPLETE_ORDER = 4,
}

export enum MISSCALL_CALLING_STATUS {
  RECEIVED = 1,
  ALLOTTED = 2,
  OUT_OF_REACH = 3,
  WANT_BOOK = 4,
  DUPLICATE = 5,
  GOT_INITIATION = 6,
  INTERESTED = 7,
  NOT_INTERESTED = 8,
}

export enum RAMAINI_SEVA_STATUS {
  PENDING = 1,
  COMPLETE = 2,
  FIRST_VERIFIED = 3,
  SECOND_VERIFIED = 4,
  FIRST_REJECT = 5,
  SECOND_REJECT = 6,
}

export function getIncompleteOrderStatusByValue(
  value: number
): string | undefined {
  for (const key in INCOMPLETE_ORDER_STATUS) {
    if (
      INCOMPLETE_ORDER_STATUS[key as keyof typeof INCOMPLETE_ORDER_STATUS] ===
      value
    ) {
      return key;
    }
  }
  return undefined; // Return undefined if no match is found
}

export function getMissCallingStatusByValue(value: number): string | undefined {
  for (const key in MISSCALL_CALLING_STATUS) {
    if (
      MISSCALL_CALLING_STATUS[key as keyof typeof MISSCALL_CALLING_STATUS] ===
      value
    ) {
      return key;
    }
  }
  return undefined; // Return undefined if no match is found
}

export function getDuplicateStatusByValue(value: number): string | undefined {
  for (const key in DUPLICATE_ORDER_STATUS) {
    if (
      DUPLICATE_ORDER_STATUS[key as keyof typeof DUPLICATE_ORDER_STATUS] ===
      value
    ) {
      return key;
    }
  }
  return undefined; // Return undefined if no match is found
}
