import {
  Instagram as FaInstagram,
  Youtube as FaYoutube,
  Facebook as FaFacebook,
  Linkedin as FaLinkedin,
  Globe as FaGlobe,
} from "lucide-react";
import { SOCIAL_PLATFORMS } from "../data/college";

const LINKS = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "facebook", label: "Facebook", Icon: FaFacebook },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "website", label: "Website", Icon: FaGlobe },
];

// Shows only the links the admin has filled in (Admin → Event info)
function SocialLinks({ info }) {
  const active = [
    ...LINKS.filter((link) => info[link.key]).map((link) => ({
      ...link,
      url: info[link.key],
    })),
    ...["BCA", "BBA"].flatMap((department) =>
      (info[`${department.toLowerCase()}Socials`] || []).map(
        ({ platform, url }, index) => ({
          key: `${department}-${platform}-${index}`,
          label: `${department} ${platform}`,
          Icon:
            SOCIAL_PLATFORMS.find((item) => item.name === platform)?.Icon ||
            FaGlobe,
          url,
        })
      )
    ),
  ];
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {active.map(({ key, label, Icon, url }) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-[42px] items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-xl text-white shadow-lg shadow-accent/30 transition hover:-translate-y-1 hover:scale-105"
          aria-label={label}
          title={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
