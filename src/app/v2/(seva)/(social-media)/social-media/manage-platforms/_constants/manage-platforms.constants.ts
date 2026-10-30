import {
  IMAGES,
  socialImages3d,
  socialMediaActionImages,
} from "@/constants/images";
import type {
  Platform,
  PlatformFeature,
  PlatformTab,
} from "../_types/manage-platforms.types";

export const PLATFORM_TABS: { value: PlatformTab; label: string }[] = [
  { value: "add", label: "Add Platform" },
  { value: "list", label: "Platform List" },
];

function feature(
  id: string,
  title: string,
  sequence: number,
  icon: string,
): PlatformFeature {
  return { id, title, sequence, icon, iconName: `${title}.png` };
}

export const SEED_PLATFORMS: Platform[] = [
  {
    id: "p-facebook",
    title: "Facebook",
    icon: socialImages3d.facebook,
    iconName: "Facebook_Icon.png",
    features: [
      feature("facebook-post", "Post", 1, socialMediaActionImages.post),
      feature("facebook-share", "Share", 2, socialMediaActionImages.share),
      feature("facebook-like", "Like", 3, socialMediaActionImages.like),
      feature(
        "facebook-comment",
        "Comment",
        4,
        socialMediaActionImages.comment,
      ),
    ],
  },
  {
    id: "p-instagram",
    title: "Instagram",
    icon: socialImages3d.instagram,
    iconName: "Instagram_Icon.png",
    features: [
      feature("instagram-post", "Post", 1, socialMediaActionImages.post),
      feature("instagram-share", "Share", 2, socialMediaActionImages.share),
      feature("instagram-like", "Like", 3, socialMediaActionImages.like),
      feature(
        "instagram-comment",
        "Comment",
        4,
        socialMediaActionImages.comment,
      ),
    ],
  },
  {
    id: "p-youtube",
    title: "YouTube",
    icon: socialImages3d.youtube,
    iconName: "YouTube_Icon.png",
    features: [
      feature(
        "youtube-subscribe",
        "Subscribe",
        1,
        socialMediaActionImages.subscribe,
      ),
      feature("youtube-like", "Like", 2, socialMediaActionImages.like),
      feature("youtube-comment", "Comment", 3, socialMediaActionImages.comment),
      feature("youtube-share", "Share", 4, socialMediaActionImages.share),
    ],
  },
  {
    id: "p-twitter",
    title: "X / Twitter",
    icon: socialImages3d.twitter,
    iconName: "Twitter_Icon.png",
    features: [
      feature("twitter-tweet", "Tweets", 1, socialMediaActionImages.post),
      feature("twitter-retweet", "Retweet", 2, socialMediaActionImages.repost),
      feature("twitter-comment", "Comment", 3, socialMediaActionImages.comment),
      feature("twitter-like", "Like", 4, socialMediaActionImages.like),
    ],
  },
  {
    id: "p-pinterest",
    title: "Pinterest",
    icon: socialImages3d.pinterest,
    iconName: "Pinterest_Icon.png",
    features: [
      feature("pinterest-pin", "Pin", 1, socialMediaActionImages.pin),
      feature(
        "pinterest-comment",
        "Comment",
        2,
        socialMediaActionImages.comment,
      ),
      feature("pinterest-share", "Share", 3, socialMediaActionImages.share),
      feature("pinterest-repin", "Repin", 4, socialMediaActionImages.repost),
    ],
  },
  {
    id: "p-threads",
    title: "Threads",
    icon: socialImages3d.threads,
    iconName: "Threads_Icon.png",
    features: [
      feature("threads-post", "Post", 1, socialMediaActionImages.post),
      feature("threads-like", "Like", 2, socialMediaActionImages.like),
      feature("threads-comment", "Comment", 3, socialMediaActionImages.comment),
      feature("threads-share", "Share", 4, socialMediaActionImages.share),
    ],
  },
  {
    id: "p-reddit",
    title: "Reddit",
    icon: socialImages3d.reddit,
    iconName: "Reddit_Icon.png",
    features: [
      feature("reddit-post", "Post", 1, socialMediaActionImages.post),
      feature(
        "reddit-subreddit",
        "Subreddit Post",
        2,
        socialMediaActionImages.post,
      ),
      feature("reddit-upvote", "Upvote", 3, socialMediaActionImages.upvote),
    ],
  },
  {
    id: "p-tumblr",
    title: "Tumblr",
    icon: socialImages3d.tumblr,
    iconName: "Tumblr_Icon.png",
    features: [
      feature("tumblr-post", "Post", 1, socialMediaActionImages.post),
      feature("tumblr-reblog", "Reblog", 2, socialMediaActionImages.repost),
      feature("tumblr-comment", "Comment", 3, socialMediaActionImages.comment),
      feature("tumblr-like", "Like", 4, socialMediaActionImages.like),
    ],
  },
  {
    id: "p-dailyhunt",
    title: "DailyHunt",
    icon: socialImages3d.dailyhunt,
    iconName: "DailyHunt_Icon.png",
    features: [
      feature("dailyhunt-post", "Post", 1, socialMediaActionImages.post),
      feature("dailyhunt-repost", "Repost", 2, socialMediaActionImages.repost),
      feature(
        "dailyhunt-comment",
        "Comment",
        3,
        socialMediaActionImages.comment,
      ),
    ],
  },
  {
    id: "p-sharechat",
    title: "ShareChat",
    icon: socialImages3d.sharechat,
    iconName: "ShareChat_Icon.png",
    features: [
      feature("sharechat-like", "Like", 1, socialMediaActionImages.like),
      feature(
        "sharechat-comment",
        "Comment",
        2,
        socialMediaActionImages.comment,
      ),
      feature("sharechat-share", "Share", 3, socialMediaActionImages.share),
    ],
  },
  {
    id: "p-group-pdf",
    title: "Group PDF",
    icon: IMAGES.file,
    iconName: "GroupPDF_Icon.png",
    features: [],
  },
  {
    id: "p-google-keyword",
    title: "Google Keyword",
    icon: socialImages3d.google,
    iconName: "GoogleKeyword_Icon.png",
    features: [],
  },
];
