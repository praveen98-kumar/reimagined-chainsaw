import * as Yup from "yup";
import { socialImages } from "@/constants/images";

export const SocialMediaFormSchema = Yup.object({
  facebook_satsang_seva: Yup.boolean(),
  facebook_page_invites: Yup.number(),
  facebook_post: Yup.number(),
  twitter_seva: Yup.number(),
  twitter_reply_seva: Yup.number(),
  yss_seva: Yup.boolean(),
  ycs_seva: Yup.number(),
  google_keyword_search_seva: Yup.boolean(),
  instagram_seva: Yup.number(),
  pinterest_seva: Yup.number(),
  linked_in_seva: Yup.number(),
  reddit_seva: Yup.number(),
  threads_seva: Yup.number(),
  tumblr_seva: Yup.number(),
  koo_seva: Yup.number(),
});

export const socialMediaFormDefaults = {
  facebook_satsang_seva: false,
  facebook_page_invites: 0,
  facebook_post: 0,
  twitter_seva: 0,
  twitter_reply_seva: 0,
  yss_seva: false, //youtube_satsang_seva
  ycs_seva: 0, //youtube_subscribe_seva
  google_keyword_search_seva: false,
  instagram_seva: 0,
  pinterest_seva: 0,
  linked_in_seva: 0,
  reddit_seva: 0,
  threads_seva: 0,
  tumblr_seva: 0,
  koo_seva: 0,
};

export const socialMediaSevaMapper: Record<
  string,
  {
    label: string;
    image: string;
  }
> = {
  facebook_satsang_seva: {
    label: "Facebook Satsang Seva",
    image: socialImages.facebook,
  },
  facebook_page_invites: {
    label: "Facebook Page Invites",
    image: socialImages.facebook,
  },
  facebook_post: {
    label: "Facebook Post",
    image: socialImages.facebook,
  },
  twitter_seva: {
    label: "Twitter Seva",
    image: socialImages.twitter,
  },
  twitter_reply_seva: {
    label: "Twitter Reply Seva",
    image: socialImages.twitter,
  },
  yss_seva: {
    label: "Youtube Satsang Seva",
    image: socialImages.youtube,
  },
  ycs_seva: {
    label: "Youtube Subscribe Seva",
    image: socialImages.youtube,
  },
  google_keyword_search_seva: {
    label: "Google Keyword Search Seva",
    image: socialImages.google,
  },
  instagram_seva: {
    label: "Instagram Seva",
    image: socialImages.instagram,
  },
  pinterest_seva: {
    label: "Pinterest Seva",
    image: socialImages.pinterest,
  },
  linked_in_seva: {
    label: "Linked In Seva",
    image: socialImages.linked,
  },
  reddit_seva: {
    label: "Reddit Seva",
    image: socialImages.reddit,
  },
  threads_seva: {
    label: "Threads Seva",
    image: socialImages.threads,
  },
  tumblr_seva: {
    label: "Tumblr Seva",
    image: socialImages.tumblr,
  },
  koo_seva: {
    label: "Koo Seva",
    image: socialImages.koo,
  },
};
