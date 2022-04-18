import GroupIcon from "@mui/icons-material/Group";
import BiotechIcon from "@mui/icons-material/Biotech";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import SettingsIcon from "@mui/icons-material/Settings";

export const navbarItems = [
  {
    id: 0,
    icon: <GroupIcon />,
    label: "Users",
    route: "users",
  },
  {
    id: 1,
    icon: <BiotechIcon />,
    label: "Samples",
    route: "samples",
  },
  {
    id: 2,
    icon: <CorporateFareIcon />,
    label: "Organizations",
    route: "organizations",
  },
  {
    id: 3,
    icon: <SettingsIcon />,
    label: "Settings",
    route: "settings",
  },
];
