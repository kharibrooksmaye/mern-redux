import GroupIcon from "@mui/icons-material/Group";
import BiotechIcon from "@mui/icons-material/Biotech";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import SettingsIcon from "@mui/icons-material/Settings";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import { LocalOffer } from "@mui/icons-material";

export const navbarItems = [
  {
    id: 0,
    icon: <GroupIcon />,
    label: "Users",
    route: "users",
    protected: true,
  },
  {
    id: 1,
    icon: <BiotechIcon />,
    label: "Samples",
    route: "samples",
    protected: true,
  },
  {
    id: 2,
    icon: <CorporateFareIcon />,
    label: "Organizations",
    route: "organizations",
    protected: true,
  },
  {
    id: 3,
    icon: <SettingsIcon />,
    label: "Settings",
    route: "settings",
    protected: true,
  },
  {
    id: 4,
    icon: <ProfileIcon />,
    label: "Profile",
    route: "profile",
    protected: true,
  },
];

export const headerItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact Us", to: "/contact" },
];
