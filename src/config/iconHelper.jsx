import {
  FaUsers,
  FaUser,
  FaBan,
  FaEye,
  FaQuestion,
} from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { RiDashboardFill } from "react-icons/ri";
import { BsFillBoxFill } from "react-icons/bs";
import { GiTakeMyMoney } from "react-icons/gi";
import { HiMiniPrinter } from "react-icons/hi2";
import {
  PiUserListBold,
  PiVaultFill,
} from "react-icons/pi";
import { BiSolidUserDetail } from "react-icons/bi";
import { TbReportAnalytics } from "react-icons/tb";
import { IoIosCube } from "react-icons/io";
import { AiOutlineBank } from "react-icons/ai";
import { GrTransaction } from "react-icons/gr";

const iconsMap = {
  fausers: FaUsers,
  fauser: FaUser,
  faban: FaBan,
  faeye: FaEye,
  mdlibrarybooks: MdLibraryBooks,
  ridashboardfill: RiDashboardFill,
  bsfillboxfill: BsFillBoxFill,
  gitakemymoney: GiTakeMyMoney,
  himiniprinter: HiMiniPrinter,
  piuserlistbold: PiUserListBold,
  pivaultfill: PiVaultFill,
  bisoliduserdetail: BiSolidUserDetail,
  tbreportanalytics: TbReportAnalytics,
  ioioscube: IoIosCube,
  aioutlinebank: AiOutlineBank,
  grtransaction: GrTransaction,
};

export const getIcon = (iconName) => {
  if (!iconName) return FaQuestion;
  const normalized = iconName.toLowerCase();
  return iconsMap[normalized] || FaQuestion;
};
