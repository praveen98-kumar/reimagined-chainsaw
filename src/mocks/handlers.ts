import { http, HttpResponse } from "msw";
import * as data from "./data";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const handlers = [
  // Always return tehsils regardless of district_id param
  http.get(`${BASE}social_media_question`, () =>
    HttpResponse.json({ data: data.platforms }),
  ),

  http.get(`${BASE}tehsil_list`, () =>
    HttpResponse.json({ data: data.tehsils }),
  ),

  // sevadar_wise: respond based on sevadar_level and tehsil filter
  http.post(`${BASE}social_media_seva_wise_report_all_regions`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const level = body?.sevadar_level;
    const tehsilId = body?.tehsil;

    if (level === "regions") {
      // Tehsil scope — return tehsil-level grouped data
      return HttpResponse.json({ data: data.tehsilWiseReport });
    }

    if (tehsilId) {
      // Tehsil filter applied — return subset matching that tehsil
      return HttpResponse.json({ data: data.getSevadarReportForTehsil(Number(tehsilId)) });
    }

    return HttpResponse.json({ data: data.sevadarWiseReport });
  }),

  http.post(`${BASE}social_media_all_seva_report`, () =>
    HttpResponse.json({ data: data.allPlatformsReport }),
  ),

  // Platform-wise: respond with data for the requested question_id
  http.post(`${BASE}social_media_report_seva_wise`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const questionId = Number(body?.question_id) || 1;
    return HttpResponse.json({ data: data.getPlatformWiseReport(questionId) });
  }),

  http.post(`${BASE}book_seva_reports`, () =>
    HttpResponse.json({ data: data.bookOrders }),
  ),
];
